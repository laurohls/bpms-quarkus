declare module 'bpmn-js/lib/NavigatedViewer' {
  export default class BpmnViewer {
    constructor(options: { container: HTMLElement })
    importXML(xml: string): Promise<{ warnings: unknown[] }>
    get(service: string): {
      zoom: (value: number | string) => void
      fitViewport: () => void
      add?: (elementId: string, config: { position: { top?: number; right?: number; bottom?: number; left?: number }; html: string }) => string
      get?: (elementId: string) => { id: string; type: string; width?: number; height?: number; businessObject?: { id?: string; name?: string } }
      getGraphics?: (elementId: string) => SVGElement | null
      on?: (event: string, callback: (event: { element: { id: string; type: string; businessObject?: { name?: string } } }) => void) => void
      fire?: (event: string, payload: { element: { id: string; type: string; businessObject?: { name?: string } } }) => void
    }
    destroy(): void
  }
}
