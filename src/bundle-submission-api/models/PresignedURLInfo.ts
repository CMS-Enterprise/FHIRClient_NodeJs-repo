interface PartValueString {
    name?: string;
    valueString?: string;
}

interface PartValueUrl {
    name?: string;
    valueUrl?: string;
}

export class PresignedURLInfo {
    partValueString?: PartValueString;
    partValueUrl?: PartValueUrl;
}
