
interface AskepFormSaveEvent {
    nodes: JQuery;
    data: URLSearchParams;
}
interface AskepFormInterface {
    root: HTMLFormElement;
    addEventListener(event: "save", listener: (event: CustomEvent<AskepFormSaveEvent>) => void);
}

var AskepForm: AskepFormInterface;


type AntenatalComplication = {
    id: string;
    text: string;
    trimester: number[]
}


type FetusElements = {
    root: HTMLElement
    closer: HTMLButtonElement
    ref: HTMLInputElement
    pulse: HTMLInputElement
    pap_head: HTMLSelectElement
    pap_head_disp: HTMLInputElement
    position: HTMLSelectElement
    position_disp: HTMLInputElement

    gs: HTMLInputElement
    crl: HTMLInputElement
    djj: HTMLInputElement
    bpd: HTMLInputElement
    hc: HTMLInputElement
    fl: HTMLInputElement
    ac: HTMLInputElement
    weight: HTMLInputElement
    age: HTMLInputElement
    age_from: HTMLInputElement
    age_to: HTMLInputElement
    hpl: HTMLInputElement
}
type FetusData = {
    ref: string;
    pulse: string;
    pap_head_disp: string;
    pap_head: string;
    presentation_disp: string;
    presentation: string;
    weight: string;
    usg: {
        age: string;
        age_from: string;
        age_to: string;
        hpl: string;
        gs: string;
        crl: string;
        djj: string;
        bpd: string;
        hc: string;
        fl: string;
        ac: string;
        position_disp: string;
        position: string;
    }
}


type ColRange = [number, -1 | number] & {
    merged?: boolean;
    text?: string;
}
type ColN = Number & {
    text?: string;
}
type ColOpt = {
    [x: number]: (number | ColN | ColRange)[]
};
type ColDef = ColOpt | ColOpt[];

type FieldDef = {
    field: string;
    cols: ColDef;
};

type ColRangeOpt = {
    merged?: boolean;
    text?: string;
}
