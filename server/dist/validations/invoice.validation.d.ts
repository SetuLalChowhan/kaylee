import { z } from "zod";
export declare const createInvoiceSchema: z.ZodObject<{
    body: z.ZodObject<{
        invoiceNo: z.ZodString;
        campaign: z.ZodString;
        issueDate: z.ZodString;
        dueDate: z.ZodString;
        amount: z.ZodString;
        status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            Pending: "Pending";
            Paid: "Paid";
            Overdue: "Overdue";
        }>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateInvoiceSchema: z.ZodObject<{
    body: z.ZodObject<{
        invoiceNo: z.ZodOptional<z.ZodString>;
        campaign: z.ZodOptional<z.ZodString>;
        issueDate: z.ZodOptional<z.ZodString>;
        dueDate: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            Pending: "Pending";
            Paid: "Paid";
            Overdue: "Overdue";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=invoice.validation.d.ts.map