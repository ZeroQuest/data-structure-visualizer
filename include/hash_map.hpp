#pragma once

#include <vector>
#ifndef HASHMAP_HPP
#define HASHMAP_HPP

#include <string>
#include <sstream>
#include <optional>
#include <functional>
#include <tuple>

// Hash map node
template <typename K, typename V>
struct HashNode {
  K key;
  V value;
  HashNode* next;
  std::string address;

  HashNode(K k, V v) : key(k), value(v), next(nullptr) {
    static int nextOffset = 0;
    const int BASE_ADDRESS = 0x4000;
    std::stringstream ss;
    ss << "0x" << std::hex << BASE_ADDRESS + nextOffset;
    address = ss.str();
    nextOffset += 4;
  }
};

// Hash map 
template <typename K, typename V>
class HashMap {
private:
  std::vector<HashNode<K, V>*> table;
  int capacity;
  int count;
  float loadFactor;

  // Hash function 
  int hash(K key) const {
    return std::hash<K>{}(key) % capacity;
  }

  // Resize and rehash
  void resize() {
    int oldCap = capacity;
    capacity *= 2;
    std::vector<HashNode<K, V>*>newTable(capacity, nullptr);

    for (int i = 0; i < oldCap; ++i) {
      HashNode<K, V>* node = table[i];
      while (node) {
        HashNode<K, V>* next = node->next;
        int index = std::hash<K>{}(node->key) % capacity;
        node->next = newTable[index];
        newTable[index] = node;
        node = next;
      }
    }

    table = std::move(newTable);
  }

public:
  // Constructor
  HashMap(int initialCapacity = 8, float maxLoad = 0.75f)
    : capacity(initialCapacity), count(0), loadFactor(maxLoad) {
    table.resize(capacity, nullptr);
  }

  // Destructor
  ~HashMap() {
    clear();
  }

  // Insert or update
  void insert(K key, V value) {
    int index = hash(key);
    HashNode<K, V>* node = table[index];

    while (node) {
      if (node->key == key) {
        node->value = value;
        return;
      }
      node = node->next;
    }

    HashNode<K, V>* newNode = new HashNode<K, V>(key, value);
    newNode->next = table[index];
    table[index] = newNode;
    count++;

    if ((float)count / capacity > loadFactor) {
      resize();
    }
  }

  // Remove
  void remove(K key) {
    int index = hash(key);
    HashNode<K, V>* node = table[index];
    HashNode<K, V>* prev = nullptr;

    while (node) {
      if (node->key == key) {
        if (prev) prev->next = node->next;
        else table[index] = node->next;
        delete node;
        count--;
        return;
      }
      prev = node;
      node = node->next;
    }
  }

  // Search existence
  bool search(K key) const {
    return get(key).has_value();
  }

  // Get value
  std::optional<V> get(K key) const {
    int index = hash(key);
    HashNode<K, V>* node = table[index];
    while (node) {
      if (node->key == key)
        return node->value;
      node = node->next;
    }
    return std::nullopt;
  }

  // Get modifiable pointer to value 
  V* getPointer(K key) {
    int index = hash(key);
    HashNode<K, V>* node = table[index];
    while (node) {
      if (node->key == key)
        return &(node->value);
      node = node->next;
    }
    return nullptr;
  }

  // Set value 
  bool setValue(K key, V newValue) {
    V* ptr = getPointer(key);
    if (!ptr) return false;
    *ptr = newValue;
    return true;
  }

  // Clear all
  void clear() {
    for (auto& bucket : table) {
      while (bucket) {
        HashNode<K, V>* tmp = bucket;
        bucket = bucket->next;
        delete tmp;
      }
      bucket = nullptr;
    }
    count = 0;
  }

  // Number of key-value pairs
  int size() const { return count; }

  // Bucket count
  int bucketCount() const { return capacity; }

  // Vector serialization 
  std::vector<std::tuple<K, V, std::string, int, std::string>> toVector() const {
    std::vector<std::tuple<K, V, std::string, int, std::string>> out;

    for (int i = 0; i < capacity; ++i) {
      HashNode<K, V>* node = table[i];
      while (node) {
        std::string nextAddr = node->next ? node->next->address : "nullptr";
        out.emplace_back(node->key, node->value, node->address, i, nextAddr);
        node = node->next;
      }
    }

    return out;
  }
};

#endif // !HASHMAP_HPP
