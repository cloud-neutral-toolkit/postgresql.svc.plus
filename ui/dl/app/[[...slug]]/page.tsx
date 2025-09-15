import CardGrid from "../../components/CardGrid";
import FileTable from "../../components/FileTable";
import Breadcrumbs from "../../components/Breadcrumbs";
import MarkdownPanel from "../../components/MarkdownPanel";
import CopyButton from "../../components/CopyButton";
import { formatDate } from "../../utils/format";

const BASE_URL = process.env.NEXT_PUBLIC_DL_BASE_URL || "https://dl.svc.plus";

interface DirItem {
  name: string;
  size: number;
  updated_at: string;
  href: string;
  sha256?: string;
}

async function getManifest() {
  try {
    const res = await fetch(`${BASE_URL}/manifest.json`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load manifest");
    return res.json();
  } catch {
    return { roots: [] } as { roots: any[] };
  }
}

async function getDir(path: string) {
  const res = await fetch(`${BASE_URL}${path}dir.json`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load dir");
  }
  return res.json();
}

export function generateStaticParams() {
  return [{ slug: [] }];
}

export const dynamicParams = false;
export const dynamic = "force-static";

export default async function Page({ params }: { params: { slug?: string[] } }) {
  const segs = params.slug ?? [];
  if (segs.length === 0) {
    const data = await getManifest();
    return (
      <main className="p-4 max-w-6xl mx-auto space-y-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-bold">dl.svc.plus Downloads</h1>
          <p className="text-sm text-gray-600">
            Browse public downloads hosted on <a href="https://dl.svc.plus" className="underline">dl.svc.plus</a>. Each directory
            is described by <code>manifest.json</code> and <code>dir.json</code> files with optional <code>tldr.md</code> and
            <code>README.md</code> documentation.
          </p>
        </section>
        <CardGrid roots={data.roots} />
      </main>
    );
  }
  const path = "/" + segs.join("/") + "/";
  try {
    const dir = await getDir(path);
    const first = dir.items[0];
    return (
      <main className="p-4 max-w-6xl mx-auto">
        <Breadcrumbs segments={segs} />
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="mb-4 flex gap-2">
              <CopyButton text={`wget -r --no-parent ${BASE_URL}${path}`} />
              {first && (
                <CopyButton text={`curl -LO ${BASE_URL}${first.href}`} />
              )}
            </div>
            <FileTable basePath={path} items={dir.items as DirItem[]} />
          </div>
          <div className="w-full lg:w-72 space-y-4">
            {dir.tldr && <MarkdownPanel url={dir.tldr} title="TL;DR" />}
            {dir.readme && <MarkdownPanel url={dir.readme} title="Docs" />}
            <div className="rounded-2xl shadow p-4">
              <h2 className="font-semibold mb-2">Meta</h2>
              <p className="text-sm">Path: {dir.path}</p>
              <p className="text-sm">Updated: {formatDate(dir.updated_at)}</p>
              <p className="text-sm mt-2">from dl.svc.plus</p>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (e) {
    return (
      <main className="p-4">
        <div className="text-center text-red-500">Failed to load directory.</div>
        <div className="mt-4 text-center">
          <button onClick={() => location.reload()} className="px-4 py-2 bg-gray-200 rounded">Retry</button>
        </div>
      </main>
    );
  }
}
