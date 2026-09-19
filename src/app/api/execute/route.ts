import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LANGUAGES } from '@/lib/piston';
import { LanguageId } from '@/lib/types';

// Piston language mapping
const PISTON_LANGUAGES: Record<LanguageId, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'cpp', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  csharp: { language: 'csharp', version: '6.12.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  html: { language: 'html', version: '5.0' },
};

// Wandbox compiler mappings
const WANDBOX_COMPILERS: Record<LanguageId, string> = {
  javascript: 'nodejs-head',
  typescript: 'typescript-head',
  python: 'cpython-head',
  cpp: 'gcc-head',
  java: 'openjdk-head',
  csharp: 'dotnet-head',
  go: 'go-head',
  rust: 'rust-head',
  html: 'html',
};

// Judge0 language IDs
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

    // Cleanly format program input with trailing newline for cin >>, input(), Scanner
    const rawInput = (stdin || '').trim();
    const programInput = rawInput !== '' ? rawInput + '\n' : '';

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

    // 2. High-Speed V8 Runtime for JavaScript (Client/Server Sandbox)
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
        // Fall through to Piston if standard runner threw
      }
    }

    // 3. Primary Execution Engine: Piston API (supports cin, input, stdin)
    try {
      const pistonConfig = PISTON_LANGUAGES[language] || { language, version: '*' };
      const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: pistonConfig.language,
          version: pistonConfig.version,
          files: [
            {
              content: code,
            }
          ],
          stdin: programInput,
        }),
      });

      if (pistonResponse.ok) {
        const data = await pistonResponse.json();
        const executionTime = Date.now() - startTime;
        const runData = data.run || {};

        const stdout = runData.stdout || '';
        const stderr = runData.stderr || (runData.output && runData.code !== 0 ? runData.output : '');
        const exitCode = typeof runData.code === 'number' ? runData.code : 0;

        return NextResponse.json({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          output: (stdout || stderr).trim(),
          code: exitCode,
          executionTime,
          language: langSpec.name,
          version: data.version ? `Piston v${data.version}` : 'Piston Execution Engine',
        });
      }
    } catch (pistonError) {
      console.warn('Piston execution fallback triggered:', pistonError);
    }

    // 4. Secondary Fallback Engine: Wandbox API
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
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          output: (stdout || stderr).trim(),
          code: status,
          executionTime,
          language: langSpec.name,
          version: 'Wandbox Cloud Engine',
        });
      }
    } catch (wandboxError) {
      console.warn('Wandbox execution fallback triggered:', wandboxError);
    }

    // 5. Tertiary Fallback Engine: Judge0 CE API
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
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          output: (stdout || stderr).trim(),
          code: status,
          executionTime,
          language: langSpec.name,
          version: 'Judge0 Engine',
        });
      }
    } catch (judge0Error) {
      console.warn('Judge0 execution fallback triggered:', judge0Error);
    }

    // 6. Ultimate Fallback
    return NextResponse.json({
      stdout: '',
      stderr: 'Unable to reach public compilation APIs. Please check your network connection.',
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

