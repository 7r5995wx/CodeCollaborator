import { LanguageId } from './types';

export interface LanguageSpec {
  id: LanguageId;
  name: string;
  pistonLanguage: string;
  version: string;
  extension: string;
  monacoLanguage: string;
  sampleCode: string;
}

export const SUPPORTED_LANGUAGES: Record<LanguageId, LanguageSpec> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript (Node.js)',
    pistonLanguage: 'javascript',
    version: '18.15.0',
    extension: 'js',
    monacoLanguage: 'javascript',
    sampleCode: `// Real-Time Collaborative JavaScript
function main() {
  const message = "Hello from CodeCollaborator!";
  console.log(message);
  
  const numbers = [1, 2, 3, 4, 5];
  const doubled = numbers.map(n => n * 2);
  console.log("Doubled array:", doubled);
}

main();`,
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    pistonLanguage: 'typescript',
    version: '5.0.3',
    extension: 'ts',
    monacoLanguage: 'typescript',
    sampleCode: `// Real-Time Collaborative TypeScript
interface Developer {
  name: string;
  role: string;
  skills: string[];
}

const dev: Developer = {
  name: "Collaborator",
  role: "Full Stack Engineer",
  skills: ["Next.js", "TypeScript", "Monaco", "WebRTC"]
};

console.log(\`Developer Profile: \${dev.name} (\${dev.role})\`);
console.log("Skills:", dev.skills.join(", "));`,
  },
  python: {
    id: 'python',
    name: 'Python 3',
    pistonLanguage: 'python',
    version: '3.10.0',
    extension: 'py',
    monacoLanguage: 'python',
    sampleCode: `# Real-Time Collaborative Python 3
import sys
import math

def calculate_fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

if __name__ == "__main__":
    print("Python Runtime Version:", sys.version.split()[0])
    fib = calculate_fibonacci(10)
    print("Fibonacci Sequence (first 10):", fib)
    print("Square root of 144 is:", math.sqrt(144))`,
  },
  cpp: {
    id: 'cpp',
    name: 'C++ (GCC)',
    pistonLanguage: 'cpp',
    version: '10.2.0',
    extension: 'cpp',
    monacoLanguage: 'cpp',
    sampleCode: `// Real-Time Collaborative C++
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "Greetings from C++ CodeCollaborator!" << std::endl;
    
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    
    std::cout << "Sum of elements: " << sum << std::endl;
    return 0;
}`,
  },
  java: {
    id: 'java',
    name: 'Java (OpenJDK)',
    pistonLanguage: 'java',
    version: '15.0.2',
    extension: 'java',
    monacoLanguage: 'java',
    sampleCode: `// Real-Time Collaborative Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Executing Java code in real-time!");
        
        int[] numbers = {1, 2, 3, 4, 5};
        int total = 0;
        for (int n : numbers) {
            total += n;
        }
        System.out.println("Total sum: " + total);
    }
}`,
  },
  csharp: {
    id: 'csharp',
    name: 'C# (.NET)',
    pistonLanguage: 'csharp',
    version: '6.12.0',
    extension: 'cs',
    monacoLanguage: 'csharp',
    sampleCode: `// Real-Time Collaborative C#
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello World from C# CodeCollaborator!");
        DateTime now = DateTime.Now;
        Console.WriteLine($"Current Time: {now:yyyy-MM-dd HH:mm:ss}");
    }
}`,
  },
  go: {
    id: 'go',
    name: 'Go (Golang)',
    pistonLanguage: 'go',
    version: '1.16.2',
    extension: 'go',
    monacoLanguage: 'go',
    sampleCode: `// Real-Time Collaborative Go
package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("Concurrent Code Collaboration with Go!")
	fmt.Printf("Execution Timestamp: %s\\n", time.Now().Format("15:04:05"))
}`,
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    pistonLanguage: 'rust',
    version: '1.68.2',
    extension: 'rs',
    monacoLanguage: 'rust',
    sampleCode: `// Real-Time Collaborative Rust
fn main() {
    println!("Hello from Rust execution engine!");
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Vector sum = {}", sum);
}`,
  },
  html: {
    id: 'html',
    name: 'HTML5 / CSS3 / JS Live Preview',
    pistonLanguage: 'html',
    version: '5.0',
    extension: 'html',
    monacoLanguage: 'html',
    sampleCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      padding: 2.5rem;
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    h1 {
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 0;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover {
      background: #2563eb;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 CodeCollaborator Web Preview</h1>
    <p>Live responsive Web view with instant hot-reloading.</p>
    <button onclick="handleClick()">Click Me!</button>
    <p id="output" style="margin-top: 1rem; font-weight: bold; color: #38bdf8;"></p>
  </div>

  <script>
    function handleClick() {
      document.getElementById('output').innerText = "Interactive JS works seamlessly! " + new Date().toLocaleTimeString();
    }
  </script>
</body>
</html>`,
  },
};
