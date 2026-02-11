
interface AskepFormSaveEvent {
    nodes: JQuery;
    data: URLSearchParams;
}
interface AskepFormInterface {
    root: HTMLFormElement;
    addEventListener(event: "save", listener: (event: CustomEvent<AskepFormSaveEvent>) => void);
}

var AskepForm: AskepFormInterface;
