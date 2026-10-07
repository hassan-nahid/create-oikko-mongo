/* eslint-disable @typescript-eslint/no-explicit-any */
import { IErrorSources, IGenericErrorResponse } from "../interfaces/error.Types"

export const handleZodError = (err: any): IGenericErrorResponse => {
    const issues = err.issues || err.errors || []

    const errorSources: IErrorSources[] = issues.map((issue: any) => {
        const path = issue.path?.length ? issue.path.join(".") : "unknown"

        return {
            path,
            message: issue.message
        }
    })

    const message =
        errorSources.length > 0
            ? errorSources.map((source) => source.message).join("; ")
            : "Validation failed"

    return {
        statusCode: 400,
        message,
        errorSources
    }
}