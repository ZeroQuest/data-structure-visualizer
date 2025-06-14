export const snippets_arraylist = {
  resize: `// Resizes the array
  void resize(int newCapacity) {
      int* newData = new int[newCapacity];

      for (int i = 0; i < size; i++) {
        newData[i] = data[i];
      }

      delete[] data;
      data = newData;
      capacity = newCapacity;
    }`,

  ensureCapacity: `// Adjusts capacity to contain the size
  void ensureCapacity() {
    if (size >= capacity) {
      resize(capacity * 2);
    }
  }`,

  add: `// Add a value to the array list
  void add(int value) {
    ensureCapacity();
    data[size++] = value;
  }`,

  insert:`// Inserts a given value at the index given
  void insert(int index, int value) {
    if (index < 0 || index > size) {
      throw std::out_of_range("Index out of range");
    }
    ensureCapacity();
    for (int i = size; i > index; --i) {
      data[i] = data[i - 1];
    }
    data[index] = value;
    ++size;
  }`,

  remove:`// Removes the element at the given index 
  void remove(int index) {
    if (index < 0 || index >= size) {
      throw std::out_of_range("Index out of range");
    }
    for (int i = index; i < size - 1; ++i) {
      data[i] = data[i + 1];
    }
    --size;
  }`,

  set:`// Sets the given index to the given value 
  void set(int index, int value) {
    if (index < 0 || index >= size) {
      throw std::out_of_range("Index out of range");
    }
    data[index] = value;
  }`,

  get:`// Gets the value at the given index 
  int get(int index) const {
     if (index < 0 || index >= size) {
       throw std::out_of_range("Index out of range");
     }
     return data[index];
  }`,

  clear:`// Clears the array 
  void clear() {
    size = 0;
  }`,

  contains:`// Finds if an element of a given value exists 
  bool contains(int value) const {
    for (int i = 0; i < size; ++i) {
      if (data[i] == value) return true;
    }
    return false;
  }`,

  indexOf:`// Finds the index of the first element with the given value 
  int indexOf(int value) const {
    for (int i = 0; i < size; ++i) {
      if (data[i] == value) return i;
    }
    return -1;
  }`,

  shrink:`// Shrinks the array to the size 
  void shrinkToFit() {
    if (size <= 0) 
    {
      resize(1);
    }
    if (size < capacity) {
      resize(size);
    }
  }`,

}
