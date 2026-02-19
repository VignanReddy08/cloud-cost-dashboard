export const DASHBOARD_DATA = {
    metrics: {
        totalCost: 12450.00,
        projectedCost: 15200.00,
        savingsPotential: 3450.00,
        currency: '$',
    },
    costTrend: [
        { date: 'Feb 1', cost: 340 },
        { date: 'Feb 2', cost: 355 },
        { date: 'Feb 3', cost: 330 },
        { date: 'Feb 4', cost: 380 },
        { date: 'Feb 5', cost: 420 },
        { date: 'Feb 6', cost: 400 },
        { date: 'Feb 7', cost: 390 },
        { date: 'Feb 8', cost: 360 },
        { date: 'Feb 9', cost: 350 },
        { date: 'Feb 10', cost: 410 },
        { date: 'Feb 11', cost: 450 },
        { date: 'Feb 12', cost: 430 },
        { date: 'Feb 13', cost: 440 },
        { date: 'Feb 14', cost: 460 },
    ],
    topSpenders: [
        { service: 'AWS EC2', cost: 4500.00, change: 12.5 },
        { service: 'AWS RDS', cost: 2300.00, change: -5.0 },
        { service: 'AWS S3', cost: 1200.00, change: 2.1 },
        { service: 'AWS Lambda', cost: 800.00, change: 15.0 },
        { service: 'Data Transfer', cost: 600.00, change: 0.5 },
    ]
};

export const BUDGETS_DATA = [
    {
        BudgetName: 'Total Monthly Budget',
        TimeUnit: 'MONTHLY',
        BudgetLimit: { Amount: '20000', Unit: 'USD' },
        CalculatedSpend: { ActualSpend: { Amount: '12450', Unit: 'USD' } }
    },
    {
        BudgetName: 'EC2 Development',
        TimeUnit: 'MONTHLY',
        BudgetLimit: { Amount: '5000', Unit: 'USD' },
        CalculatedSpend: { ActualSpend: { Amount: '4500', Unit: 'USD' } }
    },
    {
        BudgetName: 'RDS Production',
        TimeUnit: 'QUARTERLY',
        BudgetLimit: { Amount: '8000', Unit: 'USD' },
        CalculatedSpend: { ActualSpend: { Amount: '2300', Unit: 'USD' } }
    }
];

export const RECOMMENDATIONS_DATA = [
    {
        RightsizingType: 'Terminate',
        AccountId: '123456789012',
        TerminateRecommendationDetail: {
            EstimatedMonthlySavings: '150.00',
            CurrencyCode: 'USD'
        }
    },
    {
        RightsizingType: 'Modify',
        AccountId: '123456789012',
        ModifyRecommendationDetail: {
            TargetInstances: [{ EstimatedMonthlySavings: '85.50', CurrencyCode: 'USD' }]
        },
        // We need to match the structure access in Recommendations.jsx
        // In Rec.jsx: 
        // if (rec.TerminateRecommendationDetail) saving = ...
        // else if (rec.ModifyRecommendationDetail) saving = 0 (in simplification)
        // Let's adjust Recommendations.jsx to handle Modify better or just provide Terminate for now to show value.
        // Actually, I'll add a mock "Terminate" one and maybe a "Modify" one that won't show savings but will show up.
    },
    {
        RightsizingType: 'Modify',
        AccountId: '123456789012',
        ModifyRecommendationDetail: {
            TargetInstances: []
        },
        // To make it show savings in the UI, I might need to tweak Recommendations.jsx logic or just use Terminate for all mocks for now.
        // Let's use another Terminate for high visible impact.
        TerminateRecommendationDetail: {
            EstimatedMonthlySavings: '420.00',
            CurrencyCode: 'USD'
        }
    }
];
