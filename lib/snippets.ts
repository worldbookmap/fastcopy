import { promises as fs } from "node:fs";
import path from "node:path";

export type SnippetRecord = {
  id: string;
  content: string;
  summary: string;
  createdAt: string;
};

type GitHubFileResponse = {
  sha: string;
  content: string;
  encoding: string;
};

const DATA_FILE_PATH = "data/snippets.json";
const LOCAL_DATA_PATH = path.join(process.cwd(), DATA_FILE_PATH);

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";

  if (!token || !owner || !repo) {
    return null;
  }

  return { token, owner, repo, branch };
}

async function readLocalSnippets() {
  const file = await fs.readFile(LOCAL_DATA_PATH, "utf8");

  return JSON.parse(file) as SnippetRecord[];
}

async function fetchGitHubFile() {
  const config = getGitHubConfig();

  if (!config) {
    return null;
  }

  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${DATA_FILE_PATH}?ref=${config.branch}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("GitHub 저장소에서 현재 데이터를 읽지 못했습니다.");
  }

  return (await response.json()) as GitHubFileResponse;
}

export async function getSnippets() {
  try {
    const githubFile = await fetchGitHubFile();

    if (githubFile?.encoding === "base64") {
      const decoded = Buffer.from(githubFile.content, "base64").toString("utf8");
      return JSON.parse(decoded) as SnippetRecord[];
    }

    return await readLocalSnippets();
  } catch {
    return await readLocalSnippets();
  }
}

export async function persistSnippets(snippets: SnippetRecord[]) {
  const config = getGitHubConfig();

  if (!config) {
    if (process.env.VERCEL) {
      throw new Error(
        "Vercel 환경 변수 GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO를 설정해야 저장할 수 있습니다.",
      );
    }

    await fs.writeFile(LOCAL_DATA_PATH, JSON.stringify(snippets, null, 2) + "\n", "utf8");
    return;
  }

  const currentFile = await fetchGitHubFile();
  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${DATA_FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore: update snippets ${new Date().toISOString()}`,
        content: Buffer.from(JSON.stringify(snippets, null, 2) + "\n", "utf8").toString("base64"),
        sha: currentFile?.sha,
        branch: config.branch,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("GitHub 저장소에 내용을 저장하지 못했습니다. 토큰 권한과 브랜치를 확인해 주세요.");
  }
}

export function createSnippetRecord(content: string): SnippetRecord {
  const normalized = content.trim();

  return {
    id: crypto.randomUUID(),
    content: normalized,
    summary: normalized.replace(/\s+/g, " ").slice(0, 80),
    createdAt: new Date().toISOString(),
  };
}