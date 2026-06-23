import type * as monaco from "monaco-editor";

let registered = false;

export function registerScadLanguage(monacoInstance: typeof monaco) {
  if (registered) return;
  registered = true;

  monacoInstance.languages.register({ id: "scad" });

  monacoInstance.languages.setMonarchTokensProvider("scad", {
    tokenizer: {
      root: [
        [/\/\/.*$/, "comment"],
        [/\/\*/, "comment", "@comment"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string"],

        [
          /\b(module|function|if|else|for|let|each|true|false|undef|include|use)\b/,
          "keyword",
        ],

        [
          /\b(cube|sphere|cylinder|polyhedron|circle|square|polygon|text|color|translate|rotate|scale|mirror|resize|union|difference|intersection|hull|minkowski|linear_extrude|rotate_extrude|projection|children)\b/,
          "type.identifier",
        ],

        [/\$[a-zA-Z_]\w*/, "variable.predefined"],
        [/[a-zA-Z_]\w*/, "identifier"],
        [/\d+(\.\d+)?/, "number"],
        [/[{}()[\]]/, "@brackets"],
        [/[;,.]/, "delimiter"],
        [/[+\-*/%=<>!&|?:]+/, "operator"],
      ],

      comment: [
        [/[^/*]+/, "comment"],
        [/\/\*/, "comment", "@push"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, "string", "@pop"],
      ],
    },
  });
}