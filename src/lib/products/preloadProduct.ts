import getProduct from "./getProduct";

export default function preloadProduct(id: string) {
    void getProduct(id);
}