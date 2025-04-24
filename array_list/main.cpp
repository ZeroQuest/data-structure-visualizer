#include "crow_all.h"
#include "array_list.hpp"
#include <sstream>
#include <fstream>
#include <stdexcept>
#include <string>

ArrayList arrayList;

bool ends_with(const std::string& str, const std::string& suffix) {
  return str.size() >= suffix.size() &&
    str.compare(str.size() - suffix.size(), suffix.size(), suffix) == 0;
}


int main() {
  crow::SimpleApp app;

  CROW_ROUTE(app, "/add/<int>")
  ([](int value) {
    arrayList.add(value);
    return crow::response("Added " + std::to_string(value));
  });

  CROW_ROUTE(app, "/data")
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

  CROW_ROUTE(app, "/insert/<int>/<int>")
  ([](int index, int value){
    try {
      arrayList.insert(index, value);
      return crow::response(200);
    } catch (const std::out_of_range& e) {
      return crow::response(400, e.what());
    }
  });

  CROW_ROUTE(app, "/remove/<int>")
  ([](int index){
    try {
      arrayList.remove(index);
      return crow::response(200);
    } catch (const std::out_of_range& e) {
      return crow::response(400, e.what());
    }
  });

  CROW_ROUTE(app, "/contains/<int>")
  ([](int value){
    return crow::response(arrayList.contains(value) ? "true" : "false");
  });

  CROW_ROUTE(app, "/indexof/<int>")
  ([](int value){
    return crow::response(std::to_string(arrayList.indexOf(value)));
  });

  CROW_ROUTE(app, "/set/<int>/<int>")
  ([](int index, int value){
    try {
      arrayList.set(index, value);
      return crow::response(200);
    } catch (...) {
      return crow::response(400, "Invalid index");
    }
  });

  CROW_ROUTE(app, "/shrink")
  ([](){
    arrayList.shrinkToFit();
    return crow::response(200);
  });

  CROW_ROUTE(app, "/clear")
  ([](){
    arrayList.clear();
    return crow::response(200);
  });

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
 
  CROW_ROUTE(app, "/") 
  ([]() {
    std::ifstream in("public/index.html", std::ios::binary);
    if (!in) return crow::response(404, "index.html not found");

    std::ostringstream contents;
    contents << in.rdbuf();
    crow::response res(contents.str());
    res.set_header("Content-Type", "text/html");
    return res;
  });


  app.port(8000).multithreaded().run();
}
