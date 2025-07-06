# Data Structure Visualizer

An interactive web-interface tool to visualize and explore fundamental data structures in real time. Built for students, educators, and anyone interested in learning how data structures work under the hood.

## What This Tool Does

This tool provides visualizations for:

- Array List
- Linked List
- Tree Map (Black/Red tree implementation)
- Hash Map (Singly linked list collision implementation)

Each structure supports operations like:

- Insertion and deletion
- Searching for keys/values
- Visual observation of changes as operations are performed

## Built With

### Front-end

- HTML, CSS, JavaScript, and SVG
- highlight.js for syntax highlighting in code snippets

### Back-end

- C++ with the Crow web framework

## Getting Started

### Prerequisites

- C++17 compiler (e.g., g++)
- Make
- Crow (header-only, include in `include/`)
- A basic HTTP server setup or run via Crow

### Build & Run

```bash
make
./build/server
```

Or alternatively use the include run.sh script.


Then open your browser to `http://localhost:8000/index.html`.

## Author

Created by Timothy Stokes  
[GitHub Repository](https://github.com/ZeroQuest/data-structure-visualizer)

## Acknowledgements

This project uses the following open-source libraries:

- Crow v1.2.0: A C++ web framework (https://github.com/CrowCpp/Crow)
- highlight.js v11.11.1: Syntax highlighting for code blocks (https://highlightjs.org)
- SVG samples derived from [W3C SVG examples](https://www.w3.org/Graphics/SVG/), used under the [W3C Software License](https://www.w3.org/copyright/software-license-2023/).

Please see the `LICENSES/` directory for full license texts.

## License

This project is licensed under the MIT License.
