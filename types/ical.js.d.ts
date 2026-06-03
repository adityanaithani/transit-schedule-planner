declare module 'ical.js' {
  export function parse(input: string): unknown;
  export class Component {
    constructor(jCal: unknown);
    getAllSubcomponents(name: string): Component[];
    getFirstPropertyValue(name: string): string | null;
    getFirstProperty(name: string): unknown;
  }
  export class Event {
    constructor(component: Component);
    summary: string;
    location: string;
    startDate: { toJSDate(): Date };
    endDate: { toJSDate(): Date };
  }
}
