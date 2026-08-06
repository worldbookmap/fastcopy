import { NextResponse } from "next/server";

import { createSnippetRecord, getSnippets, persistSnippets } from "@/lib/snippets";

type DeleteSnippetBody = {
  id?: unknown;
  scope?: unknown;
};

export async function GET() {
  const snippets = await getSnippets();

  return NextResponse.json({ snippets });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { content?: unknown };
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { message: "저장할 내용을 입력해 주세요." },
        { status: 400 },
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { message: "내용은 5000자 이하로 입력해 주세요." },
        { status: 400 },
      );
    }

    const currentSnippets = await getSnippets();
    const nextSnippets = [createSnippetRecord(content), ...currentSnippets].slice(0, 30);

    await persistSnippets(nextSnippets);

    return NextResponse.json({ snippets: nextSnippets }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "저장 중 알 수 없는 오류가 발생했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as DeleteSnippetBody;
    const currentSnippets = await getSnippets();
    const scope = typeof body.scope === "string" ? body.scope : "single";

    if (scope === "history") {
      const nextSnippets = currentSnippets.slice(0, 1);
      await persistSnippets(nextSnippets);

      return NextResponse.json({ snippets: nextSnippets });
    }

    const id = typeof body.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json(
        { message: "삭제할 기록을 찾지 못했습니다." },
        { status: 400 },
      );
    }

    const latestSnippet = currentSnippets[0] ?? null;
    const historySnippets = currentSnippets.slice(1);
    const nextHistorySnippets = historySnippets.filter((snippet) => snippet.id !== id);

    if (historySnippets.length === nextHistorySnippets.length) {
      return NextResponse.json(
        { message: "삭제할 과거 기록이 없습니다." },
        { status: 404 },
      );
    }

    const nextSnippets = latestSnippet ? [latestSnippet, ...nextHistorySnippets] : nextHistorySnippets;
    await persistSnippets(nextSnippets);

    return NextResponse.json({ snippets: nextSnippets });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "삭제 중 알 수 없는 오류가 발생했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}