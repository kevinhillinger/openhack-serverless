

interface IArchiveReceipt {
    Store: string;
    SalesNumber: string;
    TotalCost: number;
    Items: number;
    SalesDate: string;
}

interface ILargeArchiveReceipt extends IArchiveReceipt {
    ReceiptImage: string;
}

export { IArchiveReceipt, ILargeArchiveReceipt }
