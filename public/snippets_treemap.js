export const snippets_treemap = {
  insert: `// Insert a key-value pair into the tree
  void insert(K key, V value) {
    TreeNode<K, V>* newNode = new TreeNode<K, V>(key, value);
    TreeNode<K, V>* y = nullptr;
    TreeNode<K, V>* x = root;

    while (x != nullptr) {
      y = x;
      if (key < x->key) x = x->left;
      else if (key > x->key) x = x->right;
      else {
        x->value = value;
        delete newNode;
        return;
      }
    }

    newNode->parent = y;
    if (!y) root = newNode;
    else if (key < y->key) y->left = newNode;
    else y->right = newNode;

    treeSize++;
    fixInsert(newNode);
  }`,

  fixInsert: `//Fixes red/black properties after insertion
  void fixInsert(TreeNode<K, V>* z) {
    while (z->parent && z->parent->color == Color::RED) {
      TreeNode<K, V>* grandparent = z->parent->parent;
      if (z->parent == grandparent->left) {
        TreeNode<K, V>* y = grandparent->right; // Uncle node
        if (y && y->color == Color::RED) {
          // Case 1: Uncle is red -> Recolor
          z->parent->color = Color::BLACK;
          y->color = Color::BLACK;
          grandparent->color = Color::RED;
          z = grandparent;
        } else {
          if (z == z->parent->right) {
            // Case 2: z is right child -> left rotate
            z = z->parent;
            rotateLeft(z);
          }
          // Case 3: z is left child -> right rotate
          z->parent->color = Color::BLACK;
          grandparent->color = Color::RED;
          rotateRight(grandparent);
        }
      } else {
        TreeNode<K, V>* y = grandparent->left; // Uncle node
        if (y && y->color == Color::RED) {
          z->parent->color = Color::BLACK;
          y->color = Color::BLACK;
          grandparent->color = Color::RED;
          z = grandparent;
        } else {
          if (z == z->parent->left) {
            z = z->parent;
            rotateRight(z);
          }
          z->parent->color = Color::BLACK;
          grandparent->color = Color::RED;
          rotateLeft(grandparent);
        }
      }
    }
    root->color = Color::BLACK; // Root is always black.
  }`,

  rotateLeft: `//Rotates the left child to the parent's location and the parent to the left child's location
  void rotateLeft(TreeNode<K, V>* x) {
    TreeNode<K, V>* y = x->right;     // y is x's right child
    x->right = y->left;               // Turn y's left subtree into x's right subtree
    if (y->left) y->left->parent = x;
    y->parent = x->parent;
    if (!x->parent)
      root = y;                       // x was root, now y becomes root
    else if (x == x->parent->left)
      x->parent->left = y;
    else
      x->parent->right = y;
    y->left = x;
    x->parent = y;
  }`,

  rotateRight: `//Rotates the right child to the parent's location and the parent to the right child's location
  void rotateRight(TreeNode<K, V>* y) {
    TreeNode<K, V>* x = y->left;        // x is y's left child 
    y->left = x->right;                 // Turn x's right subtree into y's left subtree
    if (x->right) x->right->parent = y;
    x->parent = y->parent;
    if (!y->parent)
      root = x;                         // y was root, now x becomes root
    else if (y == y->parent->left)
      y->parent->left = x;
    else
      y->parent->right = x;
    x->right = y;
    y->parent = x;
  }`,

  remove: `// Remove a key from the tree
  void remove(K key) {
    TreeNode<K, V>* z = root;
    while (z) {
      if (key < z->key) z = z->left;
      else if (key > z->key) z = z->right;
      else break;
    }
    if (!z) return;

    TreeNode<K, V>* y = z;
    TreeNode<K, V>* x = nullptr;
    TreeNode<K, V>* xParent = nullptr;
    Color yOriginalColor = y->color;

    if (!z->left) {
      x = z->right;
      xParent = z->parent;
      transplant(z, z->right);
    } else if (!z->right) {
      x = z->left;
      xParent = z->parent;
      transplant(z, z->left);
    } else {
      y = minimum(z->right);
      yOriginalColor = y->color;
      x = y->right;
      if (y->parent == z) {
        if (x) x->parent = y;
        xParent = y;
      } else {
        transplant(y, y->right);
        y->left = z->left;
        if (y->left) y->left->parent = y;
        y->color = z->color;
      }

      transplant(z, y);
      y->left = z->left;
      if (y->left) y->left->parent = y;
      y->color = z->color;
    }

    delete z;
    treeSize--;

    if (yOriginalColor == Color::BLACK)
      fixRemove(x, xParent);
  }`,

  transplant: `//Helper function to transplant subtrees
  //Replaces subtree rooted at u with subtree rooted at v
  void transplant(TreeNode<K, V>* u, TreeNode<K, V>* v) {
    if (!u->parent)
      root = v;
    else if (u == u->parent->left)
      u->parent->left = v;
    else
      u->parent->right = v;

    if (v)
      v->parent = u->parent;
  }`,

  minimum: `//Helper function to get the smallest node in a subtree
  TreeNode<K, V>* minimum(TreeNode<K, V>* node) const {
    while (node->left)
      node = node->left;
    return node;
  }`,

  fixRemove: `//Fixes red/black properties after removal
  void fixRemove(TreeNode<K, V>* x, TreeNode<K, V>* xParent) {
    while (x != root && (!x || x->color == Color::BLACK)) {
      if (x == xParent->left) {
        TreeNode<K, V>* w = xParent->right;
        if (w && w->color == Color::RED) {
          w->color = Color::BLACK;
          xParent->color = Color::RED;
          rotateLeft(xParent);
          w = xParent->right;
        }

        if ((!w->left || w->left->color == Color::BLACK) && 
            (!w->right || w->right->color == Color::BLACK)) {
          w->color = Color::RED;
          x = xParent;
          xParent = x->parent;
        } else {
          if (!w->right || w->right->color == Color::BLACK) {
            if (w->left) w->left->color = Color::BLACK;
            w->color = Color::RED;
            rotateRight(w);
            w = xParent->right;
          }
          w->color = xParent->color;
          xParent->color = Color::BLACK;
          if (w->right) w->right->color = Color::BLACK;
          rotateLeft(xParent);
          x = root;
        }
      } else {
        TreeNode<K, V>* w = xParent->left;
        if (w && w->color == Color::RED) {
          w->color = Color::BLACK;
          xParent->color = Color::RED;
          rotateRight(xParent);
          w = xParent->left;
        }

        if ((!w->right || w->right->color == Color::BLACK) && 
            (!w->left || w->left->color == Color::BLACK)) {
          w->color = Color::RED;
          x = xParent;
          xParent = x->parent;
        } else {
          if (!w->left || w->left->color == Color::BLACK) {
            if (w->right) w->right->color = Color::BLACK;
            w->color = Color::RED;
            rotateLeft(w);
            w = xParent->left;
          }
          w->color = xParent->color;
          xParent->color = Color::BLACK;
          if (w->left) w->left->color = Color::BLACK;
          rotateRight(xParent);
          x = root;
        }
      }
    }
    if (x) x->color = Color::BLACK;
  }`,

  search: `// Search for a key in the tree
  bool search(K key) const {
    TreeNode<K, V>* current = root;
    while (current) {
      if (key < current->key) current = current->left;
      else if (key > current->key) current = current->right;
      else return true;
    }
    return false;
  }`,

  getValue: `// Return a pointer to value if found
  V* get (K key) {
    TreeNode<K, V>* current = root;
    while (current) {
      if (key < current->key) current = current->left;
      else if (key > current->key) current = current->right;
      else return &(current->value);
    }
    return nullptr;
  }`,

  contains: `// Check if a key exists
  bool contains(K key) const {
    return search(key);
  }`,

  clear: `// Removes all elements from the tree
  void clear() {
    clear(root);
    root = nullptr;
    treeSize = 0;
  }`,

  privateClear: `//Recursively clears the TreeMap
  void clear(TreeNode<K, V>* node) {
    if (!node) return;
    clear(node->left);
    clear(node->right);
    delete node;
  }`,

  getNodeInfo: `//Gets the information of a single node.
  std::optional<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>> getNodeInfo(K key) const {
    TreeNode<K, V>* current = root;
    while (current) {
      if (key < current->key)
        current = current->left;
      else if (key > current->key)
        current = current->right;
      else {
        std::string parentAddr = current->parent ? current->parent->address : "nullptr";
        std::string leftAddr = current->left ? current->left->address : "nullptr";
        std::string rightAddr = current->right ? current->right->address : "nullptr";
        std::string colorStr = (current->color == Color::RED ? "RED" : "BLACK");
        return std::make_tuple(current->key, current->value, current->address, parentAddr, leftAddr, rightAddr, colorStr);
      }
    }
    return std::nullopt;
  }`,

  setValue: `// Update values at existing key
  bool setValue(K key, V newValue) {
    V* valuePtr = get(key);
    if (!valuePtr) return false;

    *valuePtr = newValue;
    return true;
  }`,

  size: `// Return the number of nodes in the tree
  int size() const { return treeSize; }`,

  getInorder: `//Inorder wrapper function
  std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>> getInorder() const {
    std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>> result;
    inorder(root, result);
    return result;
  }`, 

  inorder: `//Inorder traversal helper function
  void inorder(TreeNode<K, V>* node, 
              std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>>& out) const {
    if(!node) return;
    inorder(node->left, out);
    appendNodeInfo(node, out);
    inorder(node->right, out);
  }`,

  appendNodeInfo: `//Helper function to collect all node data in consistent format
  void appendNodeInfo(TreeNode<K, V>* node,
                      std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>>& out) const {
    std::string parentAddr = node->parent ? node->parent->address : "nullptr";
    std::string leftAddr = node->left ? node->left->address : "nullptr";
    std::string rightAddr = node->right ? node->right->address : "nullptr";
    std::string color = (node->color == Color::RED) ? "RED" : "BLACK";

    out.emplace_back(node->key, node->value, node->address, parentAddr, leftAddr, rightAddr, color);
  }`,

  getPreorder: `//Preorder wrapper function
  std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>> getPreorder() const {
    std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>> result;
    preorder(root, result);
    return result;
  }`,

  preorder: `//Preorder traversal helper function
  void preorder(TreeNode<K, V>* node,
                std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>>& out) const {
    if (!node) return;
    appendNodeInfo(node, out);
    preorder(node->left, out);
    preorder(node->right, out);
  }`,
  
  getPostorder: `//Postorder wrapper function
  std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>> getPostorder() const {
    std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>> result;
    postorder(root, result);
    return result;
  }`,

  postorder: `//Postorder traversal helper function
  void postorder(TreeNode<K, V>* node,
                std::vector<std::tuple<K, V, std::string, std::string, std::string, std::string, std::string>>& out) const {
    if (!node) return;
    postorder(node->left, out);
    postorder(node->right, out);
    appendNodeInfo(node, out);
  }`,

}
