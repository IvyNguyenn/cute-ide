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
  const [error, setError] = useState(undefined);

  const _handleChangeCode = (value: string, _viewUpdate: ViewUpdate) => {
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
    setError(undefined);
    setResult({ ...res.data });
  };

  const _createSubmission = async (event: React.SyntheticEvent) => {
    try {
      event.preventDefault();
      setIsSubmitting(true);
      const target = event.target as typeof event.target & {
        language: { value: string };
        input: { value: string };
      };
      const language = target.language.value;
      const input = target.input.value;

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
          language_id: parseInt(language),
          source_code: window.btoa(code),
          stdin: window.btoa(input),
        },
      };
      const res = await axios.request(options);
      const { token } = res.data;
      if (token) {
        await _getSubmission(token);
      }
    } catch (err: any) {
      console.log(err);
      const errorMessage = JSON.stringify(err?.response?.data) || err?.message;
      setError(errorMessage);
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
        <form
          id="controls-form"
          className={styles.editor__code__controls}
          onSubmit={_createSubmission}
        >
          <button type="submit" disabled={isSubmitting}>
            Run code
          </button>
          <span>
            <small>Language: </small>
            <select
              name="language"
              defaultValue={programingLanguages[3].id}
              disabled={isSubmitting}
            >
              {programingLanguages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
          </span>
        </form>
        <CodeMirror
          value={code}
          height="92vh"
          theme={mode}
          extensions={[javascript({ jsx: true })]}
          onChange={_handleChangeCode}
        />
      </div>
      <div className={styles.editor__console}>
        <div className={styles.editor__console__output}>
          <div>
            <span style={{ paddingRight: 10 }}>Output:</span>
            {isSubmitting ? (
              <small style={{ color: 'var(--blue)' }}>Running code...</small>
            ) : (
              <b style={{ color: 'var(--green)' }}>
                {result.status.description}
              </b>
            )}
          </div>
          <div className={styles.editor__console__output__result}>
            {!isSubmitting && (
              <>
                {result.time && (
                  <p style={{ color: 'var(--blue)' }}>
                    Finished in {result.time} ms
                  </p>
                )}
                {result.stdout && <p>{window.atob(result.stdout)}</p>}
                {result.stderr && (
                  <p style={{ color: 'var(--red)' }}>
                    {window.atob(result.stderr)}
                  </p>
                )}
              </>
            )}
            {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
          </div>
        </div>
        <div className={styles.editor__console__input}>
          <label>Input:</label>
          <textarea form="controls-form" name="input"></textarea>
        </div>
      </div>
    </div>
  );
}

const programingLanguages = [
  { id: 45, name: 'Assembly (NASM 2.14.02)' },
  { id: 46, name: 'Bash (5.0.0)' },
  { id: 47, name: 'Basic (FBC 1.07.1)' },
  { id: 48, name: 'C (GCC 7.4.0)' },
  { id: 52, name: 'C++ (GCC 7.4.0)' },
  { id: 49, name: 'C (GCC 8.3.0)' },
  { id: 53, name: 'C++ (GCC 8.3.0)' },
  { id: 50, name: 'C (GCC 9.2.0)' },
  { id: 54, name: 'C++ (GCC 9.2.0)' },
  { id: 51, name: 'C# (Mono 6.6.0.161)' },
  { id: 55, name: 'Common Lisp (SBCL 2.0.0)' },
  { id: 56, name: 'D (DMD 2.089.1)' },
  { id: 57, name: 'Elixir (1.9.4)' },
  { id: 58, name: 'Erlang (OTP 22.2)' },
  { id: 44, name: 'Executable' },
  { id: 59, name: 'Fortran (GFortran 9.2.0)' },
  { id: 60, name: 'Go (1.13.5)' },
  { id: 61, name: 'Haskell (GHC 8.8.1)' },
  { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  { id: 64, name: 'Lua (5.3.5)' },
  { id: 65, name: 'OCaml (4.09.0)' },
  { id: 66, name: 'Octave (5.1.0)' },
  { id: 67, name: 'Pascal (FPC 3.0.4)' },
  { id: 68, name: 'PHP (7.4.1)' },
  { id: 43, name: 'Plain Text' },
  { id: 69, name: 'Prolog (GNU Prolog 1.4.5)' },
  { id: 70, name: 'Python (2.7.17)' },
  { id: 71, name: 'Python (3.8.1)' },
  { id: 72, name: 'Ruby (2.7.0)' },
  { id: 73, name: 'Rust (1.40.0)' },
  { id: 74, name: 'TypeScript (3.7.4)' },
];

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
