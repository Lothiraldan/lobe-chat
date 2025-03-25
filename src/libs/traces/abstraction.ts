import { LangfuseGenerationClient, LangfuseSpanClient, LangfuseTraceClient } from 'langfuse-core';
import { Span as OpikSpan, Trace as OpikTrace } from 'opik';

export abstract class LobeChatTrace {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  abstract score(params: {
    name: string;
    observationId?: string;
    traceId: string;
    value: number;
  }): void;

  abstract event(params: {
    name: string;
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
  }): void;

  abstract update(params: {
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
    tags?: string[];
  }): void;

  abstract span(params: {
    input?: any;
    output?: any;
    name?: string,
    metadata?: Record<string, any>;
    tags?: string[];
  }): LobeChatSpan;

  abstract generation(params: {
    input?: any;
    output?: any;
    name?: string,
    metadata?: Record<string, any>;
    tags?: string[];
    model?: string;
    modelParameters?: any;
    startTime?: Date;
    endTime?: Date;
    completionStartTime?: Date;
  }): LobeGenerationSpan;
}

export abstract class LobeChatSpan {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  abstract update(params: {
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
    tags?: string[];
    parentObservationId?: string;
  }): void;

  abstract end(params: { output?: any }): void;
}

export abstract class LobeGenerationSpan extends LobeChatSpan {}

export class LangfuseChatSpan extends LobeChatSpan {
  private _span: LangfuseSpanClient;
  constructor(span: LangfuseSpanClient) {
    super(span.id);
    this._span = span;
  }

  update(params: {
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
    tags?: string[];
    parentObservationId?: string;
  }) {
    this._span.update(params);
  }

  end(params: { output?: any }) {
    this._span.end(params);
  }
}

export class LangfuseGenerationSpan extends LobeGenerationSpan {
  private _span: LangfuseGenerationClient;
  constructor(span: LangfuseGenerationClient) {
    super(span.id);
    this._span = span;
  }

  update(params: {
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
    tags?: string[];
    endTime?: Date;
    completionStartTime?: Date;
  }) {
    this._span.update(params);
  }

  end(params: { output?: any }) {
    this._span.end(params);
  }
}

export class LangfuseChatTrace extends LobeChatTrace {
  private _trace: LangfuseTraceClient;

  constructor(trace: LangfuseTraceClient) {
    super(trace.id);
    this._trace = trace;
  }

  score(params: { name: string; observationId?: string; traceId: string; value: number }) {
    const { name, observationId, traceId, value } = params;
    this._trace.client.score({ name, observationId, traceId, value });
  }

  event(params: {
    name: string;
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
  }) {
    this._trace.event(params);
  }

  update(params: {
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
    tags?: string[];
  }) {
    this._trace.update(params);
  }

  span(params: {
    input?: any;
    output?: any;
    name?: string,
    metadata?: Record<string, any>;
    tags?: string[];
  }) {
    return new LangfuseChatSpan(this._trace.span(params));
  }

  generation(params: {
    input?: any;
    output?: any;
    name?: string,
    metadata?: Record<string, any>;
    model?: string;
    modelParameters?: any;
    tags?: string[];
    startTime?: Date;
    endTime?: Date;
    completionStartTime?: Date;
  }): LobeGenerationSpan {
    return new LangfuseGenerationSpan(this._trace.generation(params));
  }
}

export class OpikChatSpan extends LobeChatSpan {
  private _span: OpikSpan;

  constructor(span: OpikSpan) {
    super(span.data.id);
    this._span = span;
  }

  update(params: {
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
    tags?: string[];
    parentObservationId?: string;
  }) {
    const opik_span_data = {
      input: {"input": params.input},
      output: {"output": params.output},
      metadata: params.metadata,
      tags: params.tags,
      parentSpanId: params.parentObservationId,
    }
    console.log(`Updating span ${this._span.data.id} with params`, opik_span_data);
    this._span.update(opik_span_data);
  }

  end(params: { output?: any }) {
    console.log(`Ending span ${this._span.data.id} with params`, params);
    this._span.end();
  }
}

export class OpikGenerationSpan extends LobeGenerationSpan {
  private _span: OpikSpan;

  constructor(span: OpikSpan) {
    super(span.data.id);
    this._span = span;
  }

  update(params: {
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
    tags?: string[];
    endTime?: Date;
    completionStartTime?: Date;
  }) {
    const opik_span_data = {
      ...(params.input && {input: {"input": params.input}}),
      ...(params.output && {output: {"output": params.output}}),
      metadata: params.metadata,
      tags: params.tags,
      endTime: params.endTime,
      // completionStartTime: params.completionStartTime,
    }
    console.log(`Updating span ${this._span.data.id} with params`, opik_span_data);
    this._span.update(opik_span_data);
  }

  end(params: { output?: any }) {
    console.log(`Ending span ${this._span.data.id} with params`, params);
    const opik_end_data = {
      ...(params.output && {output: {"output": params.output}}),
    }
    this._span.update(opik_end_data)
    this._span.end();
  }
}

export class OpikChatTrace extends LobeChatTrace {
  private _trace: OpikTrace;

  constructor(trace: OpikTrace) {
    super(trace.data.id);
    this._trace = trace;
  }

  score(params: { name: string; observationId?: string; traceId: string; value: number }) {
    // TODO: Implement?
  }

  event(params: {
    name: string;
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
  }) {
    // TODO
  }

  update(params: {
    input?: any;
    output?: any;
    metadata?: Record<string, any>;
    tags?: string[];
  }) {
    // TODO
  }

  span(params: {
    input?: any;
    output?: any;
    name?: string,
    metadata?: Record<string, any>;
    tags?: string[];
  }) {
    const opik_span_data = {
      type: "general" as "general" | "tool" | "llm",
      name: params.name || "span",
      input: {"input": params.input},
      output: {"output":params.output},
      metadata: params.metadata,
      tags: params.tags,
    }
    return new OpikChatSpan(this._trace.span(opik_span_data));
  }

  generation(params: {
    input?: any;
    output?: any;
    name?: string,
    metadata?: Record<string, any>;
    model?: string;
    modelParameters?: any;
    tags?: string[];
    startTime?: Date;
    endTime?: Date;
    completionStartTime?: Date;
  }) {

    // Update metadata with unsupported keys
    params.metadata = {
      ...params.metadata,
      "model": params.model,
      "model_parameters": params.modelParameters,
      "completionStartTime": params.completionStartTime,
    }

    const opik_span_data = {
      type: "llm" as "general" | "tool" | "llm",
      name: params.name || "span",
      input: {"input": params.input},
      output: {"output": params.output},
      metadata: params.metadata,
      tags: params.tags,
      model: params.model,
      provider: params.metadata?.provider,
      startTime: params.startTime,
      endTime: params.endTime,
    }
    return new OpikGenerationSpan(this._trace.span(opik_span_data));
  }
}
