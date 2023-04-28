import MyCodeMirror from './(components)/CodeMirror';

export default async function Ide() {
  return <MyCodeMirror {...process.env} />;
}
