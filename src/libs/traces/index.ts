import { Langfuse } from 'langfuse';
import { CreateLangfuseTraceBody } from 'langfuse-core';
import { Opik } from 'opik';

import { getLangfuseConfig } from '@/config/langfuse';
import { getOpikConfig } from '@/config/opik';
import { CURRENT_VERSION } from '@/const/version';
import { TraceEventClient } from '@/libs/traces/event';
import {LangfuseChatTrace} from '@/libs/traces/abstraction';
import {OpikChatTrace} from '@/libs/traces/abstraction';

/**
 * We support langfuse or Opik as the tracing system to trace the request and response
 */
export class TraceClient {
  private _client?: Langfuse;
  private _opik_client?: Opik;

  constructor() {
    this.constructor_langfuse();
    this.constructor_opik();
  }

  private constructor_langfuse() {
    const { ENABLE_LANGFUSE, LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST } =
      getLangfuseConfig();

    if (!ENABLE_LANGFUSE) return;

    // when enabled langfuse, make sure the key are ready in envs
    if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) {
      console.log('-----');
      console.error(
        "You are enabling langfuse but don't set the `LANGFUSE_PUBLIC_KEY` or `LANGFUSE_SECRET_KEY`. Please check your env",
      );

      throw new TypeError('NO_LANGFUSE_KEY_ERROR');
    }

    this._client = new Langfuse({
      baseUrl: LANGFUSE_HOST,
      publicKey: LANGFUSE_PUBLIC_KEY,
      release: CURRENT_VERSION,
      secretKey: LANGFUSE_SECRET_KEY,
    });
  }

  private constructor_opik() {
    const { ENABLE_OPIK, OPIK_API_KEY, OPIK_WORKSPACE, OPIK_PROJECT_NAME, OPIK_URL_OVERRIDE } =
      getOpikConfig();

    if (!ENABLE_OPIK) return;

    if (!OPIK_URL_OVERRIDE) {
      console.log('-----');
      console.error(
        "You are enabling opik but don't set the `OPIK_URL_OVERRIDE`. Please check your env",
      );

      throw new TypeError('NO_OPIK_URL_OVERRIDE_ERROR');
    }

    this._opik_client = new Opik({apiKey: OPIK_API_KEY, workspaceName: OPIK_WORKSPACE, projectName: OPIK_PROJECT_NAME, apiUrl: OPIK_URL_OVERRIDE })
  }

  createEvent(traceId: string) {
    const trace = this.createTrace({ id: traceId });
    if (!trace) return;

    return new TraceEventClient(trace);
  }

  createTrace(param: CreateLangfuseTraceBody) {
    if (this._client) {
      const langfuseTrace = this._client.trace({ ...param })
      return new LangfuseChatTrace(langfuseTrace)
    } else if (this._opik_client) {
      const opikBody = {
        id: param.id || undefined,
        name: param.name || "lobe-chat",
        output: param.output || undefined,
        startTime: param.timestamp || undefined,
        input: param.input || undefined,
        threadId: param.sessionId || undefined,
        metadata: param.metadata || undefined,
        tags: param.tags || undefined,
      }
      const opiktrace = this._opik_client.trace({ ...opikBody })
      return new OpikChatTrace(opiktrace)
    };
  }

  async shutdownAsync() {
    await this._client?.shutdownAsync();
  }
}
