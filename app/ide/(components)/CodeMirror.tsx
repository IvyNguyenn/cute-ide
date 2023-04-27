'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { ViewUpdate } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import styles from './CodeMirror.module.scss';

export default function MyCodeMirror(props: any) {
  const { COMPILER_API_URL, RapidAPIKey, RapidAPIHost } = props;
  const [code, setCode] = useState(
    `#include<stdio.h>

int main(void) {
    puts("Hello World!");
    return 0;
}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState({
    stdout: '',
    time: '',
    memory: 0,
    stderr: null,
    token: '',
    compile_output: null,
    message: null,
    status: { id: 0, description: '' },
  });

  const _onChange = (value: string, _viewUpdate: ViewUpdate) => {
    setCode(value);
  };

  const _getSubmission = async (token: string) => {
    const options = {
      method: 'GET',
      url: `${COMPILER_API_URL}/submissions/${token}`,
      params: {
        base64_encoded: 'true',
        fields: '*',
      },
      headers: {
        'content-type': 'application/octet-stream',
        'X-RapidAPI-Key': RapidAPIKey,
        'X-RapidAPI-Host': RapidAPIHost,
      },
    };
    const res = await axios.request(options);
    setResult({ ...res.data });
  };

  const _createSubmission = async () => {
    try {
      setIsSubmitting(true);
      const options = {
        method: 'POST',
        url: `${COMPILER_API_URL}/submissions`,
        params: {
          base64_encoded: 'true',
          fields: '*',
        },
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': RapidAPIKey,
          'X-RapidAPI-Host': RapidAPIHost,
        },
        data: {
          language_id: 52,
          source_code: window.btoa(code),
          stdin: '',
        },
      };
      const res = await axios.request(options);
      const { token } = res.data;
      if (token) {
        await _getSubmission(token);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const prefersColorScheme = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;
  const mode = prefersColorScheme ? 'dark' : 'light';

  return (
    <div className={styles.editor}>
      <div className={styles.editor__code}>
        <div className={styles.editor__code__controls}>
          <span>
            <small>Language: </small>
            <select defaultValue={52} style={{ flexShrink: 0 }}>
              <option value={52}>C</option>
              {/* <option value={63}>JavaScript</option> */}
            </select>
          </span>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={_createSubmission}
          >
            Run code
          </button>
        </div>
        <CodeMirror
          value={code}
          height="92vh"
          theme={mode}
          extensions={[javascript({ jsx: true })]}
          onChange={_onChange}
        />
      </div>
      <div className={styles.editor__output}>
        <div>
          <span style={{ paddingRight: 10 }}>Output:</span>
          {isSubmitting ? (
            <small style={{ color: 'var(--blue)' }}>Running code...</small>
          ) : (
            <b style={{ color: 'var(--green)' }}>{result.status.description}</b>
          )}
        </div>
        <div className={styles.editor__output__result}>
          {result.time && !isSubmitting && (
            <>
              <p style={{ color: 'var(--green)' }}>
                Finished in {result.time} ms
              </p>
              <p>{window.atob(result.stdout)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface SubmissionResult {
  stdout: string;
  time: string;
  memory: number;
  stderr: any;
  token: string;
  compile_output: any;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}
