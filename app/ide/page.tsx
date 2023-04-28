import CodeMirror from './(components)/CodeMirror';

export default async function Ide() {
  return <CodeMirror {...process.env} />;
}
