import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { CostExplorerClient, GetCostAndUsageCommand, GetRightsizingRecommendationCommand } from '@aws-sdk/client-cost-explorer';
import { BudgetsClient, DescribeBudgetsCommand } from '@aws-sdk/client-budgets';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import authRoutes from './auth.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Auth Routes
app.use('/api/auth', authRoutes);

// Helper to create AWS client
// Cost Explorer is a global service, must use us-east-1
const createClient = (accessKeyId, secretAccessKey, region = 'us-east-1') => {
    return new CostExplorerClient({
        region: 'us-east-1',
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
};

const createBudgetsClient = (accessKeyId, secretAccessKey, region = 'us-east-1') => {
    return new BudgetsClient({
        region: 'us-east-1',
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
};

const createSTSClient = (accessKeyId, secretAccessKey, region = 'us-east-1') => {
    // Map 'global' to us-east-1 or ensure valid region
    const validRegion = (!region || region.toLowerCase() === 'global') ? 'us-east-1' : region;
    return new STSClient({
        region: validRegion,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
};

// Verify credentials
app.post('/api/verify', async (req, res) => {
    const { accessKeyId, secretAccessKey, region } = req.body;

    if (!accessKeyId || !secretAccessKey) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
        const client = createClient(accessKeyId, secretAccessKey, region);
        // Try a simple command to verify permissions
        // We'll ask for 1 day of data just to check if auth works
        const now = new Date();
        const start = new Date(now.setDate(now.getDate() - 2)).toISOString().split('T')[0];
        const end = new Date().toISOString().split('T')[0];

        const command = new GetCostAndUsageCommand({
            TimePeriod: { Start: start, End: end },
            Granularity: 'DAILY',
            Metrics: ['UnblendedCost'],
        });

        await client.send(command);

        // Fetch Account ID
        const stsClient = createSTSClient(accessKeyId, secretAccessKey, region);
        const identityCommand = new GetCallerIdentityCommand({});
        const identityResponse = await stsClient.send(identityCommand);
        const accountId = identityResponse.Account;

        res.json({ success: true, message: 'Connection successful', accountId });
    } catch (error) {
        console.error('Verification failed:', error);
        res.status(401).json({ error: 'Connection failed: ' + (error.message || 'Invalid credentials') });
    }
});

// Fetch Cost Trend
// Fetch Cost Data
app.post('/api/cost', async (req, res) => {
    const { accessKeyId, secretAccessKey, region, days = 14 } = req.body;

    if (!accessKeyId || !secretAccessKey) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
        const client = createClient(accessKeyId, secretAccessKey, region);

        const endDate = new Date();
        // AWS End date is exclusive, so to include 'today', we need 'tomorrow'
        endDate.setDate(endDate.getDate() + 1);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        const timePeriod = { Start: startStr, End: endStr };

        // 1. Get Trend and Total (No GroupBy)
        const trendCommand = new GetCostAndUsageCommand({
            TimePeriod: timePeriod,
            Granularity: 'DAILY',
            Metrics: ['UnblendedCost'],
        });

        const trendResponse = await client.send(trendCommand);

        const trendData = trendResponse.ResultsByTime.map(item => ({
            date: item.TimePeriod.Start,
            cost: Math.max(0, parseFloat(item.Total?.UnblendedCost?.Amount || 0)) // Clamp to 0 to avoid negative values from credits
        }));

        const totalCost = trendData.reduce((acc, item) => acc + item.cost, 0);

        // 2. Get Top Spenders (Group by Service)
        const servicesCommand = new GetCostAndUsageCommand({
            TimePeriod: timePeriod,
            Granularity: 'MONTHLY',
            Metrics: ['UnblendedCost'],
            GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }]
        });

        const servicesResponse = await client.send(servicesCommand);

        // Aggregate services across time periods (if multiple months returned)
        const serviceMap = {};
        servicesResponse.ResultsByTime.forEach(period => {
            period.Groups.forEach(group => {
                const serviceName = group.Keys[0];
                const amount = Math.max(0, parseFloat(group.Metrics.UnblendedCost.Amount));
                serviceMap[serviceName] = (serviceMap[serviceName] || 0) + amount;
            });
        });

        const topSpenders = Object.entries(serviceMap)
            .map(([service, cost]) => ({ service, cost }))
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 5);

        res.json({
            metrics: {
                totalCost: totalCost,
                projectedCost: totalCost * 1.2, // Simple projection
                savingsPotential: totalCost * 0.15, // Simple estimation
                currency: '$' // AWS usually USD
            },
            costTrend: trendData,
            topSpenders: topSpenders
        });
    } catch (error) {
        console.error('Fetch cost failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch Budgets
app.post('/api/budgets', async (req, res) => {
    const { accessKeyId, secretAccessKey, region, accountId } = req.body;

    if (!accessKeyId || !secretAccessKey) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
        let targetAccountId = accountId;

        // If accountId is not provided, fetch it using STS
        if (!targetAccountId) {
            const stsClient = createSTSClient(accessKeyId, secretAccessKey, region);
            const identityCommand = new GetCallerIdentityCommand({});
            const identityResponse = await stsClient.send(identityCommand);
            targetAccountId = identityResponse.Account;
        }

        const client = createBudgetsClient(accessKeyId, secretAccessKey, region);
        const command = new DescribeBudgetsCommand({ AccountId: targetAccountId });
        const response = await client.send(command);
        res.json(response.Budgets || []);
    } catch (error) {
        // If error is related to missing budgets or permissions, handle gracefully
        console.error('Fetch budgets failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch Recommendations
app.post('/api/recommendations', async (req, res) => {
    const { accessKeyId, secretAccessKey, region } = req.body;

    if (!accessKeyId || !secretAccessKey) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
        const client = createClient(accessKeyId, secretAccessKey, region);
        const command = new GetRightsizingRecommendationCommand({
            Service: 'AmazonEC2',
            Configuration: {
                BenefitsConsidered: true,
                RecommendationTarget: 'SAME_INSTANCE_FAMILY'
            }
        });
        const response = await client.send(command);
        res.json(response.RightsizingRecommendations || []);
    } catch (error) {
        console.error('Fetch recommendations failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
