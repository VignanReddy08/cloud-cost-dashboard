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
