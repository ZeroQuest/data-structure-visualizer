export const snippets_linkedlist = {
  add: `// Append at the end of the list
  void append(T value) {
    Node<T>* newNode = new Node<T>(value);
    if (head == nullptr) {
      head = newNode;
    } else {
      Node<T>* current = head;
      while (current->next != nullptr) {
        current = current->next;
      }
      current->next = newNode;
    }
    length++;
  }`,

  insertHead: `// Push to the head of the list
  void push(T value) {
    Node<T>* newNode = new Node<T>(value);
    newNode->next = head;
    head = newNode;
    length++;
  }`,

  insert: `// Insert a node at a specific index
  void insertAt(T value, int index) {
    if (index < 0 || index > length) {
      throw std::out_of_range("Index out of bounds.");
    }

    Node<T>* newNode = new Node<T>(value);
    if (index == 0) {
      newNode->next = head;
      head = newNode;
    } else {
      Node<T>* current = head;
      for (int i = 0; i < index - 1; ++i) {
        current = current->next;
      }
      newNode->next = current->next;
      current->next = newNode;
    }
    length++;
  }`,

  removeHead: `// Remove the head from the list
  void popHead() {
    if (head == nullptr) {
      throw std::out_of_range("List is empty.");
    }
    Node<T>* temp = head;
    head = head->next;
    delete temp;
    length--;
  }`,

  removeTail: `// Remove the tail from the list
  void popTail() {
    if (head == nullptr) {
      throw std::out_of_range("List is empty.");
    }

    if (head->next == nullptr) {
      delete head;
      head = nullptr;
    } else {
      Node<T>* current = head;
      while (current->next->next != nullptr) {
        current = current->next;
      }
      delete current->next;
      current->next = nullptr;
    }

    length--;
  }`,

  remove: `// Remove a node at a specific index
  void removeAt(int index) {
    if (index < 0 || index >= length || head == nullptr) {
      throw std::out_of_range("Index out of bounds.");
    }

    Node<T>* current = head;
    if (index == 0) {
      head = current->next;
      delete current;
    } else {
      Node<T>* previous = nullptr;
      for (int i = 0; i < index; ++i) {
        previous = current;
        current = current->next;
      }
      previous->next = current->next;
      delete current;
    }
    length--;
  }`, 

  contains: `// Search for a value in the linked List
  bool search(T value) const {
    Node<T>* current = head;
    while (current != nullptr) {
      if (current->data == value) {
        return true;
      }
      current = current->next;
    }
    return false;
  }`,

  indexOf: `// Get the index of a value
  int indexOf(int value) const {
    Node<T>* temp = head;
    int index = 0;
    while(temp != nullptr) {
      if (temp->data == value) {
        return index;
      }
      temp = temp->next;
      index++;
    }
    return -1; // -1 means not found
  }`,

  set: `// Set the value at an index
  void setValueAt(int index, T value) {
    if (index < 0 || index >= length) {
      throw std::out_of_range("Index out of bounds.");
    }

    Node<T>* current = head;
    for (int i = 0; i < index; ++i) {
      current = current->next;
    }
    current->data = value;
  }`,

  clear: `// Clear the List
  void clear() {
    Node<T>* temp = head;
    while (temp != nullptr) {
      Node<T>* next = temp->next;
      delete temp;
      temp = next;
    }
    head = nullptr;
    length = 0;
  }`,
  
}
