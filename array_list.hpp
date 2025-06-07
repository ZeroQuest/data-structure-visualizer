#pragma once
#ifndef ARRAYLIST
#define ARRAYLIST

#include <vector>
#include <stdexcept>
#include <algorithm>

class ArrayList {
  private:
    int* data;
    int capacity;
    int size;

    void resize(int newCapacity) {
      int* newData = new int[newCapacity];

      for (int i = 0; i < size; i++) {
        newData[i] = data[i];
      }

      if(newCapacity == 0) {newCapacity = 1;}

      delete[] data;
      data = newData;
      capacity = newCapacity;
    }

    void ensureCapacity() {
      if (size >= capacity) {
        resize(capacity * 2);
      }
    }

  public:
    ArrayList(int initialCapacity = 4) 
      : capacity(initialCapacity), size(0) {
        data = new int[capacity];
      }
 
    ArrayList(const ArrayList& other)
      : capacity(other.capacity), size(other.size) {
        data = new int[capacity];
        std::copy(other.data, other.data + size, data);
      }

    ArrayList& operator=(const ArrayList& other) {
      if (this != &other) {
        delete[] data;
        capacity = other.capacity;
        size = other.size;
        data = new int[capacity];
        std::copy(other.data, other.data + size, data);
      }
      return *this;
    }

    ~ArrayList() {
      delete[] data;
    }

    void add(int value) {
      ensureCapacity();
      data[size++] = value;
    }

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
    }

    void remove(int index) {
      if (index < 0 || index >= size) {
        throw std::out_of_range("Index out of range");
      }
      for (int i = index; i < size - 1; ++i) {
        data[i] = data[i + 1];
      }
      --size;
    }

    void set(int index, int value) {
      if (index < 0 || index >= size) {
        throw std::out_of_range("Index out of range");
      }
      data[index] = value;
    }

    int get(int index) const {
       if (index < 0 || index >= size) {
         throw std::out_of_range("Index out of range");
       }
       return data[index];
    }

    int getSize() const {return size;}
    int getCapacity() const {return capacity;}

    bool isEmpty() const {return size == 0;}

    void clear() {
      size = 0;
    }

    bool contains(int value) const {
      for (int i = 0; i < size; ++i) {
        if (data[i] == value) return true;
      }
      return false;
    }

    int indexOf(int value) const {
      for (int i = 0; i < size; ++i) {
        if (data[i] == value) return i;
      }
      return -1;
    }

    void shrinkToFit() {
      if (size < capacity) {
        resize(size);
      }
    }

    std::vector<int> toVector() const {
      return std::vector<int>(data, data + size);
    }
};

#endif // !ARRAYLIST

