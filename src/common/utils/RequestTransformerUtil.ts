export class RequestTransformerUtil {

    /** Returns a URN UUID formatted value: urn:uuid:{guid} */
    public static urnUuidFormattedValue(guid: string): string {
        return `urn:uuid:${guid}`;
    }

}
