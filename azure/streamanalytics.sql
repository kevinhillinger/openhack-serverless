SELECT
    productId,
    productName,
    ROUND(AVG(sentimentScore), 2) as [averageSentimentScore],
    COUNT(*) AS [count]
INTO
    [powerbi-sentiment]
FROM
    [productsentiment]
GROUP BY
	productId, 
    productName,
	TumblingWindow(minute, 5)

SELECT
    productId,
    productName,
    source,
    ROUND(SUM(purchaseTotal), 2) as [totalSales],
    COUNT(*) AS [count]
INTO
    [powerbi-distributor]
FROM
    [productpurchases]
WHERE source = 'distributor'
GROUP BY
	productId, 
    productName,
    source,
	TumblingWindow(minute, 5)

SELECT
    productId,
    productName,
    source,
    ROUND(SUM(purchaseTotal), 2) as [totalSales],
    COUNT(*) AS [count]
INTO
    [powerbi-pos]
FROM
    [productpurchases]
WHERE source = 'pos'
GROUP BY
	productId, 
    productName,
    source,
	TumblingWindow(minute, 5)