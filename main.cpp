#include "crow_all.h"
#include "array_list.hpp"
#include "linked_list.hpp"
#include "hash_map.hpp"
#include "tree_map.hpp"
#include <sstream>
#include <fstream>
#include <stdexcept>
#include <string>

ArrayList arrayList;
LinkedList<int> linkedList;
TreeMap<int, int> treeMap;
HashMap<int, int> hashMap;

bool ends_with(const std::string& str, const std::string& suffix) {
  return str.size() >= suffix.size() &&
    str.compare(str.size() - suffix.size(), suffix.size(), suffix) == 0;
}


int main() {
  crow::SimpleApp app;

  // ====== Array List Routing ======

  CROW_ROUTE(app, "/arraylist/add/<int>")
  ([](int value) {
    arrayList.add(value);
    return crow::response("Added " + std::to_string(value));
  });

  CROW_ROUTE(app, "/arraylist/data")
  ([](){
    auto vec = arrayList.toVector();
    crow::json::wvalue result;
    result["size"] = arrayList.getSize();
    result["capacity"] = arrayList.getCapacity();
    result["values"] = crow::json::wvalue::list();

    for (int v : vec) {
      result["values"][result["values"].size()] = v;
    }

    return crow::response(result);
  });



  CROW_ROUTE(app, "/arraylist/insert/<int>/<int>")
  ([](int index, int value){
    try {
      arrayList.insert(index, value);
      return crow::response(200);
    } catch (const std::out_of_range& e) {
      return crow::response(400, e.what());
    }
  });

  CROW_ROUTE(app, "/arraylist/remove/<int>")
  ([](int index){
    try {
      arrayList.remove(index);
      return crow::response(200);
    } catch (const std::out_of_range& e) {
      return crow::response(400, e.what());
    }
  });

  CROW_ROUTE(app, "/arraylist/contains/<int>")
  ([](int value){
    return crow::response(arrayList.contains(value) ? "true" : "false");
  });

  CROW_ROUTE(app, "/arraylist/indexof/<int>")
  ([](int value){
    return crow::response(std::to_string(arrayList.indexOf(value)));
  });

  CROW_ROUTE(app, "/arraylist/set/<int>/<int>")
  ([](int index, int value){
    try {
      arrayList.set(index, value);
      return crow::response(200);
    } catch (...) {
      return crow::response(400, "Invalid index");
    }
  });

  CROW_ROUTE(app, "/arraylist/shrink")
  ([](){
    arrayList.shrinkToFit();
    return crow::response(200);
  });

  CROW_ROUTE(app, "/arraylist/clear")
  ([](){
    arrayList.clear();
    return crow::response(200);
  });

  // ====== Linked List Routing ======

  CROW_ROUTE(app, "/linkedlist/add/<int>")
  ([](int value) {
    linkedList.append(value);
    return crow::response("Added " + std::to_string(value) + " to linked list.");
  });

  CROW_ROUTE(app, "/linkedlist/data")
  ([]() {
    auto data = linkedList.toVector();
    crow::json::wvalue result;
    result["size"] = linkedList.getSize();

    std::vector<crow::json::wvalue> valuesVec;
    valuesVec.reserve(data.size());

    for (const auto& node : data) {
      int value = std::get<0>(node);
      const std::string& addr = std::get<1>(node);
      const std::string& nextAddr = std::get<2>(node);

      crow::json::wvalue nodeJson;
      nodeJson["data"] = value;
      nodeJson["address"] = addr;
      nodeJson["nextAddress"] = nextAddr;

      valuesVec.push_back(std::move(nodeJson));
    }

    result["values"] = std::move(valuesVec);

    return crow::response(result);
  });

  CROW_ROUTE(app, "/linkedlist/inserthead/<int>")
  ([](int value) {
    linkedList.push(value);
    return crow::response("Inserted " + std::to_string(value) + " at head.");
  });
  
  CROW_ROUTE(app, "/linkedlist/insert/<int>/<int>") 
  ([](int index, int value) {
    try {
      linkedList.insertAt(index, value);
      return crow::response(200);
    } catch (const std::out_of_range& e) {
      return crow::response(400, e.what());
    }
  });

  CROW_ROUTE(app, "/linkedlist/removehead")
  ([]() {
    try {
      linkedList.popHead();
      return crow::response("Removed head of linked list.");
    } catch (const std::out_of_range& e) {
      return crow::response(400, e.what());
    }
  });

  CROW_ROUTE(app, "/linkedlist/removetail")
  ([]() {
    try {
      linkedList.popTail();
      return crow::response("Removed tail of linked list.");
    } catch (const std::out_of_range& e) {
      return crow::response(400, e.what());
    }
  });

  CROW_ROUTE(app, "/linkedlist/remove/<int>")
  ([](int index) {
    try {
      linkedList.removeAt(index);
      return crow::response(200);
    } catch (const std::out_of_range& e) {
      return crow::response(400, e.what());
    }
  });

  CROW_ROUTE(app, "/linkedlist/setAt/<int>/<int>")
  ([](int index, int value) {
    try {
      linkedList.setValueAt(index, value);
      return crow::response("Set index " + std::to_string(index) + " to value " + std::to_string(value));
    } catch (const std::out_of_range& e) {
      return crow::response(400, e.what());
    }
  });

  CROW_ROUTE(app, "/linkedlist/contains/<int>")
  ([](int value) {
    return crow::response(linkedList.search(value) ? "true" : "false");
  });

  CROW_ROUTE(app, "/linkedlist/indexof/<int>")
  ([](int value) {
    return crow::response(std::to_string(linkedList.indexOf(value)));
  });

  CROW_ROUTE(app, "/linkedlist/clear")
  ([]() {
    linkedList.clear();
    return crow::response(200);
  });

  // ====== Tree Map Routing ====== 

  //Data
  CROW_ROUTE(app, "/treemap/data")
  ([]() {
    auto data = treeMap.toVector();
    crow::json::wvalue result;
    result["size"] = treeMap.size();

    std::vector<crow::json::wvalue> nodes;
    nodes.reserve(data.size());

    for (const auto& node : data) {
      crow::json::wvalue nodeJson;
      nodeJson["key"] = std::get<0>(node);
      nodeJson["value"] = std::get<1>(node);
      nodeJson["address"] = std::get<2>(node);
      nodeJson["parent"] = std::get<3>(node);
      nodeJson["left"] = std::get<4>(node);
      nodeJson["right"] = std::get<5>(node);
      nodeJson["color"] = std::get<6>(node);

      nodes.push_back(std::move(nodeJson));
    }

    result["nodes"] = std::move(nodes);

    return crow::response(result);
  });

  // Insert
  CROW_ROUTE(app, "/treemap/insert/<int>/<int>")
  ([](int key, int value) {
    treeMap.insert(key, value);
    return crow::response("Inserted key=" + std::to_string(key) + ", value=" + std::to_string(value));
  });

  // Remove
  CROW_ROUTE(app, "/treemap/remove/<int>")
  ([](int key) {
    treeMap.remove(key);
    return crow::response("Removed key=" + std::to_string(key));
  });

  // Get value (if exists)
  CROW_ROUTE(app, "/treemap/get/<int>")
  ([](int key) {
    auto val = treeMap.get(key);
    return crow::response(val ? std::to_string(*val) : "null");
  });

  // Get node info
  CROW_ROUTE(app, "/treemap/nodeinfo/<int>")
  ([](int key) {
    auto info = treeMap.getNodeInfo(key);
    if (!info) return crow::response(404, "Node not found");

    auto [k, v, addr, parent, left, right, color] = *info;
    crow::json::wvalue json;
    json["key"] = k;
    json["value"] = v;
    json["address"] = addr;
    json["parent"] = parent;
    json["left"] = left;
    json["right"] = right;
    json["color"] = color;
    return crow::response(json);
  });

  // Set value if given a key
  CROW_ROUTE(app, "/treemap/setvalue/<int>/<int>")
  ([](int key, int newValue) {
      bool updated = treeMap.setValue(key, newValue);
      if (!updated) {
          return crow::response(404, "Node not found or update failed");
      }
      return crow::response(200, "Value updated");
  });

  // Searches the treemap for a key
  CROW_ROUTE(app, "/treemap/search/<int>")
  ([](int key) {
      bool found = treeMap.search(key);
      return crow::response(found ? "true" : "false");
  });

  // Clear
  CROW_ROUTE(app, "/treemap/clear")
  ([] {
    treeMap.clear();
    return crow::response("TreeMap cleared");
  });

  // Size
  CROW_ROUTE(app, "/treemap/size")
  ([] {
    return crow::response(std::to_string(treeMap.size()));
  });

  // Inorder traversal
  CROW_ROUTE(app, "/treemap/inorder")
  ([] {
    auto nodes = treeMap.getInorder();
    crow::json::wvalue result;

    std::vector<crow::json::wvalue> nodeList;
    nodeList.reserve(nodes.size());

    for (const auto& [key, value, address, parent, left, right, color] : nodes) {
      crow::json::wvalue node;
      node["key"] = key;
      node["value"] = value;
      node["address"] = address;
      node["parent"] = parent;
      node["left"] = left;
      node["right"] = right;
      node["color"] = color;

      nodeList.push_back(std::move(node));
    }

    result["values"] = std::move(nodeList);
    result["size"] = nodes.size();

    return crow::response(result);
  });


  // Preorder traversal
  CROW_ROUTE(app, "/treemap/preorder")
  ([] {
    auto nodes = treeMap.getPreorder();
    crow::json::wvalue result;

    std::vector<crow::json::wvalue> nodeList;
    nodeList.reserve(nodes.size());

    for (const auto& [key, value, address, parent, left, right, color] : nodes) {
      crow::json::wvalue node;
      node["key"] = key;
      node["value"] = value;
      node["address"] = address;
      node["parent"] = parent;
      node["left"] = left;
      node["right"] = right;
      node["color"] = color;

      nodeList.push_back(std::move(node));
    }

    result["values"] = std::move(nodeList);
    result["size"] = nodes.size();

    return crow::response(result);
  });

  // Postorder traversal
  CROW_ROUTE(app, "/treemap/postorder")
  ([] {
    auto nodes = treeMap.getPostorder();
    crow::json::wvalue result;

    std::vector<crow::json::wvalue> nodeList;
    nodeList.reserve(nodes.size());

    for (const auto& [key, value, address, parent, left, right, color] : nodes) {
      crow::json::wvalue node;
      node["key"] = key;
      node["value"] = value;
      node["address"] = address;
      node["parent"] = parent;
      node["left"] = left;
      node["right"] = right;
      node["color"] = color;

      nodeList.push_back(std::move(node));
    }

    result["values"] = std::move(nodeList);
    result["size"] = nodes.size();

    return crow::response(result);
  });

  // Vector serialization (same format as inorder)
  CROW_ROUTE(app, "/treemap/vector")
  ([] {
    auto nodes = treeMap.toVector();  // Likely same as getInorder
    crow::json::wvalue result;

    std::vector<crow::json::wvalue> nodeList;
    nodeList.reserve(nodes.size());

    for (const auto& [key, value, address, parent, left, right, color] : nodes) {
      crow::json::wvalue node;
      node["key"] = key;
      node["value"] = value;
      node["address"] = address;
      node["parent"] = parent;
      node["left"] = left;
      node["right"] = right;
      node["color"] = color;

      nodeList.push_back(std::move(node));
    }

    result["values"] = std::move(nodeList);
    result["size"] = nodes.size();

    return crow::response(result);
  });

  // ========= Hash Map Routing =========

  // Hashmap data
  CROW_ROUTE(app, "/hashmap/data")
  ([]() {
    auto data = hashMap.toVector();
    crow::json::wvalue out;
    int idx = 0;
    
    if (data.empty()) return crow::response(out);

    for (auto& [k, v, addr, bucket, nextAddr] : data) {
      crow::json::wvalue entry;
      entry["key"] = k;
      entry["value"] = v;
      entry["address"] = addr;
      entry["bucket"] = bucket;
      entry["next"] = nextAddr;
      out[idx++] = {
        {"key", k},
        {"value", v},
        {"address", addr},
        {"bucket", bucket},
        {"next", nextAddr}
      };
    }
    return crow::response(out);
  });

  // Insert or update entry
  CROW_ROUTE(app, "/hashmap/insert/<int>/<int>")
  ([](int key, int value) {
    hashMap.insert(key, value);
    return crow::response(200, "Inserted");
  });

   // Get a value by key
  CROW_ROUTE(app, "/hashmap/get/<int>")
  ([](int key) {
    auto result = hashMap.get(key);
    if (!result) return crow::response(404, "Key not found");

    crow::json::wvalue res;
    res["key"] = key;
    res["value"] = *result;
    return crow::response(res);
  });

  // Check if key exists
  CROW_ROUTE(app, "/hashmap/has/<int>")
  ([](int key) {
    bool found = hashMap.search(key);
    return crow::response(found ? "true" : "false");
  });

  // Remove an entry by key
  CROW_ROUTE(app, "/hashmap/remove/<int>")
  ([](int key) {
    if (!hashMap.search(key)) return crow::response(404, "Key not found");
    hashMap.remove(key);
    return crow::response(200, "Removed");
  });

   // Update the value for an existing key
  CROW_ROUTE(app, "/hashmap/set/<int>/<int>")
  ([](int key, int value) {
    if (!hashMap.setValue(key, value)) {
      return crow::response(404, "Key not found");
    }
    return crow::response(200, "Updated");
  });

  // Clear the hashmap
  CROW_ROUTE(app, "/hashmap/clear")
  ([]() {
    hashMap.clear();
    return crow::response(200, "Cleared");
  });

  // Return size and capacity
  CROW_ROUTE(app, "/hashmap/info")
  ([]() {
    crow::json::wvalue res;
    res["size"] = hashMap.size();
    res["buckets"] = hashMap.bucketCount();
    return crow::response(res);
  });

  // General Crow Routing

  CROW_ROUTE(app, "/<path>")
  ([](const crow::request& req, std::string path){
    if (path.empty()){ path = "index.html"; }
    if (path.find("..") != std::string::npos)
      return crow::response(403);

    std::ifstream in ("public/" + path, std::ios::binary);
    if (!in) return crow::response(404);
    
    std::ostringstream contents;
    contents << in.rdbuf();
    crow::response res(contents.str());

    if (ends_with(path, ".js")) res.set_header("Content-Type", "application/javascript");
    else if (ends_with(path, ".css")) res.set_header("Content-Type", "text/css");
    else if (ends_with(path, ".html")) res.set_header("Content-Type", "text/html");

    return res;
  });
 
  app.port(8000).multithreaded().run();
}
