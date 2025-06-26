#pragma once

#ifndef LINKEDLIST
#define LINKEDLIST

#include <iostream>
#include <vector>
#include <string>
#include <cstdint>
#include <sstream>
#include <stdexcept>
#include <tuple>

// Node Struct
template <typename T>
struct Node {
  T data;
  Node* next;
  std::string fakeAddress;

  // Static counter for fake memory addresses
  static uintptr_t nextFakeAddress;

  Node(T value) : data(value), next(nullptr) {
    std::stringstream ss;
    ss << "0x" << std::hex << nextFakeAddress;
    fakeAddress = ss.str();
    nextFakeAddress += 4;
  }
};

// Initialize the start of the fake addresses
template <typename T>
uintptr_t Node<T>::nextFakeAddress = 0x1000;


// Linked List class 
template <typename T>
class LinkedList {
private:
  Node<T>* head;
  int length;

public:
  // Constructor
  LinkedList() : head(nullptr), length(0) {};
 
  // Destructor
  ~LinkedList() {
    Node<T>* current = head;
    while (current != nullptr) {
      Node<T>* nextNode = current->next;
      delete current;
      current = nextNode;
    }
  }

  // Append at the end of the List
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
  }

  void push(T value) {
    Node<T>* newNode = new Node<T>(value);
    newNode->next = head;
    head = newNode;
    length++;
  }

  // Insert a node at a specific index
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
  }

  void popHead() {
    if (head == nullptr) {
      throw std::out_of_range("List is empty.");
    }
    Node<T>* temp = head;
    head = head->next;
    delete temp;
    length--;
  }

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
  }

  // Remove a node at a specific index
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
  }

  void setValueAt(int index, T value) {
    if (index < 0 || index >= length) {
      throw std::out_of_range("Index out of bounds.");
    }

    Node<T>* current = head;
    for (int i = 0; i < index; ++i) {
      current = current->next;
    }
    current->data = value;
  }


  // Print the linked List
  void print() const {
    Node<T>* current = head;
    while (current != nullptr) {
      std::cout << current->data << " -> ";
      current = current->next;
    }
    std::cout << "nullptr" << std::endl;
  }

  // Get the size of the linked List
  int getSize() const {
    return length;
  }

  // Convert linked list to a vector for easier representation
  std::vector<std::tuple<T, std::string, std::string>> toVector() const {
    std::vector<std::tuple<T, std::string, std::string>> result;
    Node<T>* temp = head;
    while (temp != nullptr) {
      std::string nextAddr = (temp->next) ? temp->next->fakeAddress : "nullptr";
      result.push_back(std::make_tuple(temp->data, temp->fakeAddress, nextAddr));
      temp = temp->next;
    }
    return result;
  }

  // Clear the List
  void clear() {
    Node<T>* temp = head;
    while (temp != nullptr) {
      Node<T>* next = temp->next;
      delete temp;
      temp = next;
    }
    head = nullptr;
    length = 0;
  }

  // Search for a value in the linked List
  bool search(T value) const {
    Node<T>* current = head;
    while (current != nullptr) {
      if (current->data == value) {
        return true;
      }
      current = current->next;
    }
    return false;
  }

  // Get the index of a value
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
  }


};

#endif // !LINKEDLIST_HPP

