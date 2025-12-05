export class DateTimeUtil {

    /** Returns current UTC time in yyyy-MM-ddTHH:mm:ssZ format */
    public static getCurrentUtc(): string {
        return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    }

    /** Formats a given Date as UTC in yyyy-MM-ddTHH:mm:ssZ format */
    public static formatAsUtc(dateTime: Date): string {
        return dateTime.toISOString().replace(/\.\d{3}Z$/, "Z");
    }

    /** Returns current local date/time with offset in yyyy-MM-ddTHH:mm:ss±HH:mm format */
    public static getCurrentWithOffset(): string {
        const now = new Date();

        const pad = (n: number) => String(n).padStart(2, "0");

        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1);
        const day = pad(now.getDate());
        const hour = pad(now.getHours());
        const minute = pad(now.getMinutes());
        const second = pad(now.getSeconds());

        const offsetMinutes = now.getTimezoneOffset();
        const sign = offsetMinutes > 0 ? "-" : "+";
        const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
        const offsetMins = pad(Math.abs(offsetMinutes) % 60);

        return `${year}-${month}-${day}T${hour}:${minute}:${second}${sign}${offsetHours}:${offsetMins}`;
    }
}
