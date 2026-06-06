# WebLang — Complete Language Tutorial

WebLang is designed to have simple syntax and instant visuals. Easy to learn, hard to master!

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Comments](#2-comments)
3. [Variables](#3-variables)
4. [Data Types](#4-data-types)
5. [String Interpolation](#5-string-interpolation)
6. [UI Elements](#6-ui-elements)
7. [Element Properties](#7-element-properties)
8. [The `as` Keyword (Naming Elements)](#8-the-as-keyword-naming-elements)
9. [Event Handlers](#9-event-handlers)
10. [The `update` Keyword (Reactivity)](#10-the-update-keyword-reactivity)
11. [Input Binding](#11-input-binding)
12. [Expressions & Operators](#12-expressions--operators)
13. [Control Flow](#13-control-flow)
14. [Arrays & Indexing](#14-arrays--indexing)
15. [Functions](#15-functions)
16. [Built-in Functions](#16-built-in-functions)
17. [Canvas Drawing API](#17-canvas-drawing-api)
18. [The `app` Keyword](#18-the-app-keyword)
19. [Saving & Sharing Apps](#19-saving--sharing-apps)
20. [Complete Examples](#20-complete-examples)
21. [Advanced Patterns](#21-advanced-patterns)
22. [Common Errors](#22-common-errors)

---

## 1. Getting Started

Open the Code Editor from the desktop or Start Menu. You'll see a starter template. Click the Run button (▶) to execute your code immediately. The output appears below the editor.

Every execution runs in a fresh environment, so variables start from scratch each time.

---

## 2. Comments

Comments are ignored by the interpreter. Use them to document your code.

```
// This is a single-line comment

/*
  This is a
  multi-line comment
*/
```

Comments can appear anywhere in your code.

---

## 3. Variables

Variables are created with the `=` operator. No `let`, `var`, or type declaration needed.

```
count = 0
name = "WebOS"
pi = 3.14
isReady = true
```

Variables are dynamically typed — they can hold any type of value, and the type can change.

```
x = 10      // x is a number
x = "ten"   // now x is a string
```

### Compound Assignment

Shorthand operators modify a variable in place:

```
x = 10
x += 5   // x is now 15
x -= 3   // x is now 12
x *= 2   // x is now 24
x /= 4   // x is now 6
```

If the variable doesn't exist yet, compound assignment treats the current value as `0`.

### Variable Names

Names must start with a letter or underscore, and can contain letters, numbers, and underscores. Case-sensitive.

```
count   // valid
myVar   // valid
_value  // valid
2cool   // INVALID (starts with number)
my-var  // INVALID (hyphen not allowed)
```

---

## 4. Data Types

### Numbers

Integers and decimals:

```
x = 42
y = 3.14
z = -7
```

### Strings

Double-quoted text:

```
msg = "Hello, World!"
path = "C:\\Users\\name"
```

### Booleans

```
ready = true
done = false
```

### Null

Represents "no value":

```
result = null
```

### Arrays

Ordered lists of values:

```
items = [1, 2, 3]
mixed = ["apple", 42, true]
empty = []
```

Access elements by index (0-based):

```
items = [10, 20, 30]
first = items[0]    // 10
second = items[1]   // 20
```

The `+` operator appends to an array:

```
list = [1, 2]
list = list + 3    // list is now [1, 2, 3]
```

---

## 5. String Interpolation

Embed variable values directly inside strings using curly braces:

```
name = "Alice"
age = 30
Text "Hello, {name}! You are {age} years old."
// Displays: Hello, Alice! You are 30 years old.
```

Any valid expression can go inside the braces:

```
Text "2 + 2 = {2 + 2}"
Text "Uppercase: {str(name)}"
```

Interpolation updates dynamically when you use `update` (see section 10).

---

## 6. UI Elements

This is where WebLang shines. You create visual elements by simply naming their type.

### Text

Displays a line of text.

```
Text "Hello, World!"
Text "This is a second line."
Text greeting    // displays the value of the variable `greeting`
```

### Button

A clickable button. The body (`{ ... }`) defines what happens when clicked.

```
Button "Click me!" {
  Text "You clicked the button!"
}
```

### Input

A single-line text input field. The text expression binds it to a variable.

```
Input name placeholder:"Enter your name"
// as the user types, the variable `name` updates automatically
```

### Textarea

A multi-line text input.

```
Textarea description placeholder:"Write a long message..."
```

### Image

Displays an image from a URL.

```
Image "https://example.com/photo.jpg"
```

### Container

A bordered box that can hold other elements inside it.

```
Container "Optional Title" {
  Text "This text is inside the container."
  Button "Inside Button" { Text "Nested!" }
}
```

The text parameter is optional.

### Canvas

An interactive drawing canvas. The `width` and `height` properties set the canvas resolution. Use `as` to name it for drawing operations. The body can contain `onDown`, `onMove`, `onUp` event handlers that receive `mouseX` and `mouseY` variables.

```
Canvas width:500 height:400 as canvas {
  onDown { set canvas.fillCircle = [mouseX, mouseY, 10] }
  onMove { set canvas.fillCircle = [mouseX, mouseY, 5] }
}
```

See [Canvas Drawing API](#17-canvas-drawing-api) for all available drawing commands.

### Link

A clickable link. Works like a button but styled as a hyperlink.

```
Link "Click here" {
  Text "You followed the link!"
}
```

### List

An unordered list. Elements inside become list items.

```
List "Shopping List" {
  Text "Milk"
  Text "Eggs"
  Text "Bread"
}
```

---

## 7. Element Properties

Elements accept `key: value` pairs for configuration. Place them after the text expression but before `as` or the body.

```
Text "Hello" id: "greeting" style: "bold"
Input name placeholder:"Your name" maxlength: 20
Image "logo.png" width: 200 height: 100
Container width: 400 {
  Text "Inside"
}
Button "Save" id: "save-btn" class: "primary" {
  // handler
}
```

Common properties:
- `id` — sets HTML `id` attribute
- `placeholder` — placeholder text for inputs
- `width`, `height` — dimensions (in pixels)
- `src` — image source URL

Any unrecognized property is set as an HTML attribute on the element.

---

## 8. The `as` Keyword (Naming Elements)

The `as` keyword gives an element a name so you can reference it later, especially with `update`.

```
Text "Count: {count}" as counter
```

This names the element `counter`. Now you can update it reactively:

```
Button "Increment" {
  count = count + 1
  update counter   // refresh the text element named "counter"
}
```

Named elements are automatically updated when you call `update` with their name. Without `as`, elements can't be targeted by `update`.

If you call `update` with no arguments, all named elements are refreshed.

---

## 9. Event Handlers

Event handlers are blocks of code that run when the user interacts with an element.

### Button Click

```
Button "Say Hi" {
  Text "Hi there!"
}
```

### Link Click

```
Link "Show more" {
  Container {
    Text "Hidden content revealed!"
  }
}
```

Inside an event handler, `this.outputEl` is set to the parent container, so new elements are created in the same context as the original app.

Variables are shared between the main code and event handlers — a variable set in one click is visible in another.

---

## 10. The `update` Keyword (Reactivity)

The `update` command refreshes the text content of named elements, re-evaluating any `{variable}` interpolations.

### Update a specific element

```
count = 0
Text "Value: {count}" as display

Button "++" { count = count + 1; update display }
```

### Update all named elements

```
count = 0
name = ""
Text "Count: {count}" as cDisplay
Text "Name: {name}" as nDisplay

Button "Go" {
  count = count + 1
  name = "test"
  update   // refreshes both cDisplay and nDisplay
}
```

`update` only affects text content inside named elements. It does NOT re-run your code or re-create elements. It finds all `{variable}` patterns in text nodes and replaces them with current values.

---

## 11. Input Binding

When you create an `Input` element with a variable name as its text, the input is bound to that variable automatically:

```
username = ""
Input username placeholder:"Type here"
```

Now `username` always reflects whatever the user has typed. You can use it anywhere:

```
Button "Show" {
  Text "You entered: {username}"
}
```

This works with `Input` only (not `Textarea` in v1). The variable updates on every keystroke.

---

## 12. Expressions & Operators

WebLang supports a full expression syntax, with standard operator precedence.

### Arithmetic

| Op | Meaning     | Example        |
|----|-------------|----------------|
| +  | Addition    | `5 + 3` → 8    |
| -  | Subtraction | `10 - 4` → 6   |
| *  | Multiplication | `3 * 4` → 12 |
| /  | Division    | `10 / 3` → 3.333... |
| -  | Negation    | `-x`           |

### Comparison

| Op | Meaning          | Example           |
|----|------------------|-------------------|
| == | Equal            | `5 == 5` → true   |
| != | Not equal        | `5 != 3` → true   |
| <  | Less than        | `3 < 5` → true    |
| >  | Greater than     | `5 > 3` → true    |
| <= | Less or equal    | `5 <= 5` → true   |
| >= | Greater or equal | `5 >= 3` → true   |

### Logical

| Op | Meaning | Example               |
|----|---------|-----------------------|
| && | AND     | `true && false` → false |
| \|\| | OR   | `true \|\| false` → true  |
| !  | NOT     | `!true` → false       |

### Operator Precedence (highest to lowest)

1. `!` `-` (unary)
2. `*` `/`
3. `+` `-`
4. `<` `>` `<=` `>=`
5. `==` `!=`
6. `&&`
7. `||`

Use parenthes to override:

```
result = (2 + 3) * 4   // 20, not 14
```

---

## 13. Control Flow

### if / else if / else

```
score = 85

if score >= 90 {
  Text "Grade: A"
} else if score >= 80 {
  Text "Grade: B"
} else {
  Text "Grade: C or lower"
}
```

The condition can be any expression that evaluates to true/false:

```
if name != "" {
  Text "Hello, {name}!"
}

if count {
  Text "count is non-zero!"
}
```

### for Loops

Iterate over an array or a number range:

```
// Over an array
fruits = ["apple", "banana", "cherry"]
for fruit in fruits {
  Text "I like {fruit}"
}

// Over a number range (0 to n-1)
for i in 5 {
  Text "Item #{i + 1}"
}
```

Inside `for`, the loop variable is scoped to the loop body. You can access the current array element:

```
scores = [85, 92, 78]
total = 0
for s in scores {
  total = total + s
}
avg = total / len(scores)
Text "Average: {avg}"
```

---

## 14. Arrays & Indexing

Create arrays with square brackets:

```
list = [10, 20, 30]
```

Access elements with `[index]` (0-based):

```
first = list[0]   // 10
last = list[2]    // 30
```

Combine `for` with `len()` and indexing:

```
items = ["a", "b", "c"]
for i in len(items) {
  Text "{i + 1}. {items[i]}"
}
```

Append to arrays with `+`:

```
tasks = []
Button "Add" {
  tasks = tasks + "new task"
  update
}
```

You cannot remove elements in v1 — reassign the array instead.

---

## 15. Functions

Define reusable functions with the `function` keyword:

```
function greet(name) {
  Text "Hello, {name}!"
}

greet("Alice")
greet("Bob")
```

Functions can return values with `return`:

```
function add(a, b) {
  return a + b
}

result = add(3, 4)
Text "3 + 4 = {result}"
```

Functions are first-class values — you can assign them to variables, pass them around, and call them.

### Recursion

```
function factorial(n) {
  if n <= 1 {
    return 1
  }
  return n * factorial(n - 1)
}

Text "5! = {factorial(5)}"
```

Parameters are passed by value. Functions create their own scope — variables inside don't leak out.

---

## 16. Built-in Functions

### `alert(message)`

Shows a browser alert dialog.

```
Button "Info" { alert("This is WebOS!") }
```

### `rand(min, max)`

Returns a random number in the range `[min, max)`.

```
roll = rand(1, 7)     // 1 to 6
d100 = rand(1, 101)   // 1 to 100
```

### `len(value)`

Returns the length of a string or array.

```
Text len("hello")     // 5
list = [1, 2, 3]
Text len(list)        // 3
Text len("")          // 0
```

### `parseNum(string)`

Converts a string to a number (or 0 if it fails).

```
a = "42"
b = parseNum(a) + 8   // b is 50
```

### `str(value)`

Converts any value to a string.

```
n = 42
Text str(n) + " is the answer"
```

---

## 17. Canvas Drawing API

The Canvas element gives you a pixel drawing surface with mouse events. You draw by using the `set` command with drawing operations on a named canvas.

### Creating a Canvas

```
Canvas width:500 height:400 as myCanvas
```

The `width` and `height` properties set the drawing area in pixels.

### Mouse Events

Canvas bodies can contain event handlers that fire on mouse interactions. Inside handlers, `mouseX` and `mouseY` give the cursor position relative to the canvas.

```
Canvas width:400 height:300 as canvas {
  onDown { set canvas.fillCircle = [mouseX, mouseY, 10] }
  onMove { set canvas.fillCircle = [mouseX, mouseY, 5] }
  onUp   { set canvas.fillCircle = [mouseX, mouseY, 15, "red"] }
}
```

- `onDown` — fires when mouse button is pressed
- `onMove` — fires when the mouse moves (while pressed)
- `onUp` — fires when mouse button is released

### Drawing State

Set these properties on the canvas to configure the drawing context:

| Command | Description | Example |
|---|---|---|
| `set canvas.fillStyle = color` | Fill color for shapes | `set canvas.fillStyle = "red"` |
| `set canvas.strokeStyle = color` | Outline color | `set canvas.strokeStyle = "#00ff00"` |
| `set canvas.lineWidth = n` | Line thickness in pixels | `set canvas.lineWidth = 5` |
| `set canvas.font = string` | Text font | `set canvas.font = "20px Arial"` |

Colors can be named (`"red"`, `"blue"`), hex (`"#ff0000"`), rgb (`"rgb(255,0,0)"`), or any CSS color string.

### Drawing Operations

These commands trigger actual drawing. The value is always an array of arguments.

#### Shapes

| Command | Args | Description |
|---|---|---|
| `set canvas.fillRect = [x, y, w, h]` | x, y, width, height | Filled rectangle |
| `set canvas.strokeRect = [x, y, w, h]` | x, y, width, height | Outlined rectangle |
| `set canvas.fillCircle = [cx, cy, r]` | center x, center y, radius | Filled circle |
| `set canvas.strokeCircle = [cx, cy, r]` | center x, center y, radius | Outlined circle |
| `set canvas.line = [x1, y1, x2, y2]` | start x/y, end x/y | Straight line |
| `set canvas.clearRect = [x, y, w, h]` | x, y, width, height | Clear a rectangle to transparent |
| `set canvas.clear = []` | (no args) | Clear entire canvas |

#### Path Drawing (for complex shapes)

```
set canvas.beginPath = []
set canvas.moveTo = [x, y]
set canvas.lineTo = [x, y]
set canvas.stroke = []
set canvas.fill = []
```

Example — draw a triangle:

```
set canvas.fillStyle = "blue"
set canvas.beginPath = []
set canvas.moveTo = [100, 50]
set canvas.lineTo = [150, 150]
set canvas.lineTo = [50, 150]
set canvas.fill = []
```

#### Text

| Command | Args | Description |
|---|---|---|
| `set canvas.fillText = ["text", x, y]` | string, x, y | Draw filled text |

### Complete Example: Simple Paint App

```
Canvas width:400 height:300 as canvas {
  onDown {
    set canvas.fillStyle = "black"
    set canvas.fillCircle = [mouseX, mouseY, 3]
  }
  onMove {
    set canvas.fillStyle = "black"
    set canvas.fillCircle = [mouseX, mouseY, 3]
  }
}

Button "Clear" { set canvas.clear = [] }
```

### Example: Color Picker Painter

```
color = "black"
size = 5

Canvas width:400 height:300 as canvas {
  onDown { set canvas.fillStyle = color; set canvas.fillCircle = [mouseX, mouseY, size] }
  onMove { set canvas.fillStyle = color; set canvas.fillCircle = [mouseX, mouseY, size] }
}

Button "Red"   { color = "red" }
Button "Blue"  { color = "blue" }
Button "Black" { color = "black" }

Text "Size:"
Button "Small"  { size = 3 }
Button "Medium" { size = 8 }
Button "Large"  { size = 15 }

Button "Clear Canvas" { set canvas.clear = [] }
```

---

## 18. The `app` Keyword

The `app` keyword defines a self-contained application. This is used for saving and sharing apps.

```
app "Counter" {
  count = 0
  Text "Count: {count}" as display

  Button "+" { count = count + 1; update display }
  Button "-" { count = count - 1; update display }
}
```

When you save a WebLang file with `.wl` extension, the `app` keyword gives it a name. Apps can be opened from the Files app.

You can omit `app` for quick scripts in the Code Editor — it's only needed for packaged applications.

---

## 19. Saving & Sharing Apps

### Save an app

1. In the Code Editor, click Examples, select "Save as App", or use the App Store app.
2. When prompted, give your app a name.
3. The app is saved in browser localStorage with a `.wl` extension.

### Share an app

1. Open the Files app to see all saved files.
2. Click a `.wl` file to run it in a new window.
3. Copy the code from the Code Editor and share it with others.
4. Recipients can paste it into the App Store app and click Install & Run.

### Load examples

The Code Editor comes with built-in examples:
1. Click the Examples button.
2. Enter the number of the example you want to load.

---

## 20. Complete Examples

### Example 1: Counter

```
count = 0
Text "Counter: {count}" as display

Button "+" { count = count + 1; update display }
Button "-" {
  if count > 0 { count = count - 1 }
  update display
}
Button "Reset" { count = 0; update display }
```

### Example 2: Todo List

```
todos = []
task = ""

Text "My Todo List"
Input task placeholder:"What needs to be done?"

Button "Add Task" {
  if task != "" {
    todos = todos + task
    task = ""
    update
  }
}

Text "Tasks: {len(todos)}" as todoCount

for i in len(todos) {
  Text "{i + 1}. {todos[i]}"
}
```

### Example 3: Calculator

```
a = 0
b = 0
result = 0

Text "Simple Calculator"
Input a placeholder:"First number"
Input b placeholder:"Second number"

Button "Add" { result = a + b; update }
Button "Subtract" { result = a - b; update }
Button "Multiply" { result = a * b; update }
Button "Divide" {
  if b != 0 { result = a / b } else { result = "Error: div by 0" }
  update
}

Text "Result: {result}" as output
```

### Example 4: Dice Roller

```
count = 1
Text "Dice Roller" as title

Button "Roll!" {
  result = rand(1, 7)
  Text "You rolled a {result}!"
}
```

### Example 5: Greeting App

```
name = ""
greeting = "Hello"

Text "Greeting App"
Input name placeholder:"Your name"

Button "English" { greeting = "Hello"; update }
Button "Spanish" { greeting = "Hola"; update }
Button "French" { greeting = "Bonjour"; update }

Text "{greeting}, {name}!" as message
```

---

## 21. Advanced Patterns

### State Machine

```
state = "menu"

Button "Start Game" {
  state = "playing"
  Text "Game started!"
}

if state == "menu" {
  Text "Press Start to play"
}
```

### Dynamic List with Conditional Display

```
items = []
showAll = true

Text "Items: {len(items)}"
Input newItem placeholder:"Add item"

Button "Add" {
  if newItem != "" {
    items = items + newItem
    newItem = ""
    update
  }
}

Button "Toggle All/Short" {
  showAll = !showAll
  update
}

for i in len(items) {
  if showAll || i < 3 {
    Text "- {items[i]}"
  }
}
```

### Nested Containers

```
Container "Outer" {
  Text "Level 1"
  Container "Inner" {
    Text "Level 2"
    Container {
      Text "Level 3"
    }
  }
}
```

### Using Functions for Reuse

```
function createCard(title, content) {
  Container {
    Text title
    Text content
    Button "Close" { Text "{title} dismissed" }
  }
}

createCard("Note 1", "This is the first note")
createCard("Note 2", "This is the second note")
```

---

## 22. Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Undefined variable: x` | Using a variable before setting it | Add `x = 0` or `x = ""` before use |
| `Expected PUNCT } got ...` | Missing closing brace `}` | Check that every `{` has a matching `}` |
| `Unexpected token ...` | Typo or invalid syntax | Check for missing quotes, wrong operators |
| Division by zero in output | You divided by zero | Check denominator before dividing (`if b != 0`) |
| Nothing appears when I run | Code may have syntax error | Check the output panel for error messages |

### Debugging Tips

- Start simple: just `Text "hello"` and verify it works
- Add one feature at a time
- Use `alert()` to see variable values: `alert(count)`
- Check that `update` targets the correct named element
- Make sure event handlers don't try to use undefined variables

---

## Quick Reference

```
// Comments
// Line comment
/* Block comment */

// Variables
name = value
x += 1      // compound assignment

// Types
n = 42          // number
s = "text"      // string
b = true        // boolean
n = null        // null
a = [1, 2, 3]   // array

// String interpolation
Text "Hello, {name}!"

// UI Elements (text and props optional)
Text "string" prop:value as name { ... }
Button "label" { on_click_code }
Input varName placeholder:"..."
Textarea varName
Image "url"
Container { nested_elements }
Link "text" { onclick_code }
List { items }
Canvas width:400 height:300 as name {
  onDown { set name.fillCircle = [mouseX, mouseY, 10] }
  onMove { set name.line = [prevX, prevY, mouseX, mouseY] }
}

// Control flow
if condition { ... } else { ... }
for var in array_or_number { ... }

// Functions
function name(params) { ... return value }

// update
update elementName    // refresh one named element
update                // refresh all named elements

// Canvas drawing (via set)
set canvas.fillStyle = "red"
set canvas.fillRect = [x, y, w, h]
set canvas.fillCircle = [cx, cy, r]
set canvas.strokeRect = [x, y, w, h]
set canvas.strokeCircle = [cx, cy, r]
set canvas.line = [x1, y1, x2, y2]
set canvas.fillText = ["text", x, y]
set canvas.clear = []
set canvas.beginPath = []
set canvas.moveTo = [x, y]
set canvas.lineTo = [x, y]
set canvas.stroke = []
set canvas.fill = []

// Built-in functions
alert(msg)
rand(min, max)
len(value)
parseNum(string)
str(value)

// App definition
app "Name" { ... }
```
