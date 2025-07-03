export const snippets_hashmap = {
  insert: `// Insert or update
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
  }`,

  hash: `// Hash function 
  // Using standard c++ hashing function
  int hash(K key) const {
    return std::hash<K>{}(key) % capacity;
  }`,

  resize: `// Resize and rehash
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
  }`,

  remove: `// Remove
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
  }`,

  search: `// Search existence
  bool search(K key) const {
    return get(key).has_value();
  }`,

  get: `// Get value
  std::optional<V> get(K key) const {
    int index = hash(key);
    HashNode<K, V>* node = table[index];
    while (node) {
      if (node->key == key)
        return node->value;
      node = node->next;
    }
    return std::nullopt;
  }`,

  getPointer: `// Get modifiable pointer to value 
  V* getPointer(K key) {
    int index = hash(key);
    HashNode<K, V>* node = table[index];
    while (node) {
      if (node->key == key)
        return &(node->value);
      node = node->next;
    }
    return nullptr;
  }`,

  set: `// Set value 
  bool setValue(K key, V newValue) {
    V* ptr = getPointer(key);
    if (!ptr) return false;
    *ptr = newValue;
    return true;
  }`,

  clear: `// Clear all
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
  }`,

};
