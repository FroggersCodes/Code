import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const challenges = [
  // JavaScript challenges
  {
    title: "Off By One Loop",
    description: "This function should return the sum of all numbers in the array, but it's missing the last element.",
    language: "javascript",
    buggyCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    sum += arr[i];
  }
  return sum;
}`,
    fixedCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
    hint: "Check the loop boundary condition",
    difficulty: 1,
    category: "off-by-one",
  },
  {
    title: "Wrong Comparison",
    description: "This function should check if a user is an admin, but it always returns true.",
    language: "javascript",
    buggyCode: `function isAdmin(user) {
  if (user.role = "admin") {
    return true;
  }
  return false;
}`,
    fixedCode: `function isAdmin(user) {
  if (user.role === "admin") {
    return true;
  }
  return false;
}`,
    hint: "Look at the comparison operator",
    difficulty: 1,
    category: "syntax",
  },
  {
    title: "Missing Return",
    description: "This function should return the largest number in an array, but it returns undefined.",
    language: "javascript",
    buggyCode: `function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
}`,
    fixedCode: `function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`,
    hint: "What does the function give back?",
    difficulty: 1,
    category: "logic",
  },
  {
    title: "String Reversal Bug",
    description: "This function should reverse a string but produces wrong results.",
    language: "javascript",
    buggyCode: `function reverseString(str) {
  let reversed = "";
  for (let i = str.length; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
    fixedCode: `function reverseString(str) {
  let reversed = "";
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
    hint: "Check the starting index",
    difficulty: 2,
    category: "off-by-one",
  },
  {
    title: "Async Await Trap",
    description: "This function should fetch user data and return the parsed JSON, but it doesn't wait for the result.",
    language: "javascript",
    buggyCode: `async function getUser(id) {
  const response = fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return data;
}`,
    fixedCode: `async function getUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return data;
}`,
    hint: "Are you waiting for all the promises?",
    difficulty: 2,
    category: "runtime",
  },
  {
    title: "Array Mutation Mistake",
    description: "This function should return a new sorted array without modifying the original, but it mutates the input.",
    language: "javascript",
    buggyCode: `function getSorted(arr) {
  return arr.sort((a, b) => a - b);
}`,
    fixedCode: `function getSorted(arr) {
  return [...arr].sort((a, b) => a - b);
}`,
    hint: "Does .sort() create a new array?",
    difficulty: 3,
    category: "logic",
  },
  {
    title: "Closure Gotcha",
    description: "This should create functions that log 0, 1, 2 but all log 3.",
    language: "javascript",
    buggyCode: `function createLoggers() {
  const loggers = [];
  for (var i = 0; i < 3; i++) {
    loggers.push(function() {
      console.log(i);
    });
  }
  return loggers;
}`,
    fixedCode: `function createLoggers() {
  const loggers = [];
  for (let i = 0; i < 3; i++) {
    loggers.push(function() {
      console.log(i);
    });
  }
  return loggers;
}`,
    hint: "Think about variable scoping",
    difficulty: 3,
    category: "logic",
  },
  {
    title: "Wrong Equality Check",
    description: "This function to check if two arrays are equal always returns false for identical arrays.",
    language: "javascript",
    buggyCode: `function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) return false;
  }
  return true;
}

// Bug: The function itself is fine, but it's called wrong:
function checkArrays(arr1, arr2) {
  if (arr1 === arr2) {
    return true;
  }
  return arraysEqual(arr1, arr2);
}`,
    fixedCode: `function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Bug: The function itself is fine, but it's called wrong:
function checkArrays(arr1, arr2) {
  return arraysEqual(arr1, arr2);
}`,
    hint: "How does === work with arrays?",
    difficulty: 3,
    category: "logic",
  },
  {
    title: "TypeError on Null",
    description: "This function crashes when the user object doesn't have an address.",
    language: "javascript",
    buggyCode: `function getCity(user) {
  return user.address.city;
}`,
    fixedCode: `function getCity(user) {
  return user.address?.city;
}`,
    hint: "What if address is undefined?",
    difficulty: 2,
    category: "runtime",
  },
  {
    title: "Fibonacci Fix",
    description: "This recursive fibonacci function returns wrong values.",
    language: "javascript",
    buggyCode: `function fibonacci(n) {
  if (n <= 1) return 1;
  return fibonacci(n - 1) + fibonacci(n - 3);
}`,
    fixedCode: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    hint: "Check the base case and recursive call",
    difficulty: 2,
    category: "logic",
  },
  // Python challenges
  {
    title: "Indentation Error",
    description: "This Python function has an indentation problem that causes a syntax error.",
    language: "python",
    buggyCode: `def greet(name):
    if name:
    message = f"Hello, {name}!"
    return message
    return "Hello, stranger!"`,
    fixedCode: `def greet(name):
    if name:
        message = f"Hello, {name}!"
        return message
    return "Hello, stranger!"`,
    hint: "Python cares about indentation",
    difficulty: 1,
    category: "syntax",
  },
  {
    title: "List Append vs Extend",
    description: "This function should flatten a list of lists into a single list, but produces nested lists.",
    language: "python",
    buggyCode: `def flatten(lists):
    result = []
    for lst in lists:
        result.append(lst)
    return result`,
    fixedCode: `def flatten(lists):
    result = []
    for lst in lists:
        result.extend(lst)
    return result`,
    hint: "append vs extend - what's the difference?",
    difficulty: 2,
    category: "logic",
  },
  {
    title: "Mutable Default Argument",
    description: "This function behaves unexpectedly when called multiple times without arguments.",
    language: "python",
    buggyCode: `def add_item(item, items=[]):
    items.append(item)
    return items`,
    fixedCode: `def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items`,
    hint: "Default arguments are evaluated once in Python",
    difficulty: 3,
    category: "logic",
  },
  {
    title: "Range Off By One",
    description: "This function should print numbers 1 through 10, but misses the last number.",
    language: "python",
    buggyCode: `def print_numbers():
    result = []
    for i in range(1, 10):
        result.append(i)
    return result`,
    fixedCode: `def print_numbers():
    result = []
    for i in range(1, 11):
        result.append(i)
    return result`,
    hint: "range() end value is exclusive",
    difficulty: 1,
    category: "off-by-one",
  },
  {
    title: "Dictionary Key Error",
    description: "This function crashes when looking up a missing key.",
    language: "python",
    buggyCode: `def get_score(scores, name):
    return scores[name]`,
    fixedCode: `def get_score(scores, name):
    return scores.get(name, 0)`,
    hint: "What happens when the key doesn't exist?",
    difficulty: 1,
    category: "runtime",
  },
  {
    title: "String Immutability",
    description: "This function tries to capitalize the first letter but doesn't work.",
    language: "python",
    buggyCode: `def capitalize_first(s):
    if s:
        s[0] = s[0].upper()
    return s`,
    fixedCode: `def capitalize_first(s):
    if s:
        s = s[0].upper() + s[1:]
    return s`,
    hint: "Strings in Python are immutable",
    difficulty: 2,
    category: "runtime",
  },
  {
    title: "Integer Division",
    description: "This function should return the average as a float, but returns an integer in Python 2 style.",
    language: "python",
    buggyCode: `def average(numbers):
    total = sum(numbers)
    return total // len(numbers)`,
    fixedCode: `def average(numbers):
    total = sum(numbers)
    return total / len(numbers)`,
    hint: "// vs / in Python",
    difficulty: 1,
    category: "logic",
  },
  {
    title: "Variable Scope Bug",
    description: "This function should count vowels but the counter resets each iteration.",
    language: "python",
    buggyCode: `def count_vowels(text):
    vowels = "aeiouAEIOU"
    for char in text:
        count = 0
        if char in vowels:
            count += 1
    return count`,
    fixedCode: `def count_vowels(text):
    vowels = "aeiouAEIOU"
    count = 0
    for char in text:
        if char in vowels:
            count += 1
    return count`,
    hint: "Where is the counter initialized?",
    difficulty: 1,
    category: "logic",
  },
  {
    title: "List Comprehension Fix",
    description: "This should filter even numbers and double them, but the logic is backwards.",
    language: "python",
    buggyCode: `def double_evens(numbers):
    return [x * 2 for x in numbers if x % 2 != 0]`,
    fixedCode: `def double_evens(numbers):
    return [x * 2 for x in numbers if x % 2 == 0]`,
    hint: "Check the filter condition",
    difficulty: 2,
    category: "logic",
  },
  {
    title: "Recursive Base Case",
    description: "This recursive function to calculate factorial causes infinite recursion.",
    language: "python",
    buggyCode: `def factorial(n):
    return n * factorial(n - 1)`,
    fixedCode: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
    hint: "Every recursion needs a base case",
    difficulty: 2,
    category: "logic",
  },
];

async function main() {
  console.log("Seeding challenges...");

  for (const challenge of challenges) {
    await prisma.challenge.create({ data: challenge });
  }

  console.log(`Seeded ${challenges.length} challenges`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
