import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LANGUAGES } from '@/lib/piston';
import { LanguageId } from '@/lib/types';

// Wandbox compiler mappings (Free, open public REST API)
const WANDBOX_COMPILERS: Record<LanguageId, string> = {
  javascript: 'nodejs-head',
  typescript: 'typescript-head',
  python: 'python-head',
  cpp: 'gcc-head',
  java: 'openjdk-head',
  csharp: 'dotnet-head',
  go: 'go-head',
  rust: 'rust-head',
  html: 'html',
};

// Judge0 language IDs (Fallback public CE instance)
const JUDGE0_LANGUAGE_IDS: Record<LanguageId, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  cpp: 54,
  java: 62,
  csharp: 51,
  go: 60,
  rust: 73,
  html: 0,
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { language, code, stdin } = body as { language: LanguageId; code: string; stdin?: string };

    const programInput = stdin || '';

    if (!language || !SUPPORTED_LANGUAGES[language]) {
      return NextResponse.json(
        { error: 'Unsupported programming language' },
        { status: 400 }
      );
    }

    if (!code || code.trim() === '') {
      return NextResponse.json(
        { stdout: '', stderr: '', output: 'No code provided to execute.', code: 0, executionTime: 0 },
        { status: 200 }
      );
    }

    const langSpec = SUPPORTED_LANGUAGES[language];

    // 1. HTML Live Preview
    if (language === 'html') {
      return NextResponse.json({
        stdout: 'HTML preview is rendered live in the Web Preview tab.',
        stderr: '',
        output: 'HTML preview active.',
        code: 0,
        executionTime: Date.now() - startTime,
        language: 'HTML5 Live Preview',
      });
    }

    // 2. High-Speed V8 Runtime for JavaScript
    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          error: (...args: any[]) => logs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          warn: (...args: any[]) => logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          info: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        };

        const runner = new Function('console', 'prompt', code);
        const inputLines = programInput.split('\n');
        let lineIdx = 0;
        const mockPrompt = () => inputLines[lineIdx++] || '';

        runner(customConsole, mockPrompt);

        return NextResponse.json({
          stdout: logs.join('\n') || 'Code executed successfully with no console logs.',
          stderr: '',
          output: logs.join('\n'),
          code: 0,
          executionTime: Date.now() - startTime,
          language: 'JavaScript (V8 Runtime)',
          version: 'Node.js 18.x',
        });
      } catch (err: any) {
        return NextResponse.json({
          stdout: '',
          stderr: err.toString(),
          output: err.toString(),
          code: 1,
          executionTime: Date.now() - startTime,
          language: 'JavaScript (V8 Runtime)',
        });
      }
    }

    // 3. Try Primary Execution Engine: Wandbox API with stdin input
    try {
      const wandboxCompiler = WANDBOX_COMPILERS[language] || 'gcc-head';
      const wandboxResponse = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          compiler: wandboxCompiler,
          code: code,
          stdin: programInput,
        }),
      });

      if (wandboxResponse.ok) {
        const data = await wandboxResponse.json();
        const executionTime = Date.now() - startTime;

        const stdout = data.program_output || data.stdout || '';
        const stderr = (data.compiler_error ? data.compiler_error + '\n' : '') + (data.program_error || data.stderr || '');
        const status = data.status === '0' || data.status === 0 ? 0 : (data.status ? parseInt(data.status, 10) : 0);

        return NextResponse.json({
          stdout,
          stderr,
          output: stdout || stderr,
          code: status,
          executionTime,
          language: langSpec.name,
          version: 'Wandbox Cloud Engine',
        });
      }
    } catch (wandboxError) {
      console.warn('Wandbox execution fallback triggered:', wandboxError);
    }

    // 4. Try Secondary Fallback Engine: Judge0 CE API with stdin input
    try {
      const judge0LangId = JUDGE0_LANGUAGE_IDS[language] || 71;
      const judge0Response = await fetch('https://ce.judge0.com/submissions?wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language_id: judge0LangId,
          source_code: code,
          stdin: programInput,
        }),
      });

      if (judge0Response.ok) {
        const data = await judge0Response.json();
        const executionTime = Date.now() - startTime;

        const stdout = data.stdout || '';
        const stderr = (data.compile_output ? data.compile_output + '\n' : '') + (data.stderr || '');
        const status = data.status?.id === 3 ? 0 : 1;

        return NextResponse.json({
          stdout,
          stderr,
          output: stdout || stderr,
          code: status,
          executionTime,
          language: langSpec.name,
          version: 'Judge0 Engine',
        });
      }
    } catch (judge0Error) {
      console.warn('Judge0 execution fallback triggered:', judge0Error);
    }

    // 5. Ultimate Fallback: Clear notification
    return NextResponse.json({
      stdout: '',
      stderr: 'Unable to reach public compilation APIs. Please check your internet connection.',
      output: 'Network error',
      code: 1,
      executionTime: Date.now() - startTime,
      language: langSpec.name,
    });
  } catch (error: any) {
    return NextResponse.json({
      stdout: '',
      stderr: `Execution Error: ${error.message || 'Failed to execute code.'}`,
      output: error.message,
      code: 1,
      executionTime: Date.now() - startTime,
      language: 'Execution Engine',
    });
  }
}
