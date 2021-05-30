class Loader {
  async load(path) {
    let res = await fetch(path);
    return await res.arrayBuffer();
  }
}

export default Loader;
