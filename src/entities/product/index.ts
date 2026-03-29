/*
MODULE_CONTRACT: Expose the public product entity surface for frontend consumers.
SCOPE: Re-export the stable product types and API helpers only.
DEPENDS: ./model/types, ./api/fetchProducts, ./api/fetchProductById, ./api/adminProductApi
LINKS: [ProductEntityApi][index][BLOCK_DEFINE_PRODUCT_INDEX]

MODULE_MAP:
- adminCreateProduct - Public export declared in this module.
- adminDeleteProduct - Public export declared in this module.
- adminListProducts - Public export declared in this module.
- adminUpdateProduct - Public export declared in this module.
- adminUploadImage - Public export declared in this module.
- fetchProductById - Public export declared in this module.
- fetchProducts - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_DEFINE_PRODUCT_INDEX
Public entrypoint for the product entity slice.
END_BLOCK_DEFINE_PRODUCT_INDEX
CHANGE_SUMMARY: Adds a narrow barrel that exposes the product contracts and transport helpers.
*/
export {
  adminCreateProduct,
  adminDeleteProduct,
  adminListProducts,
  adminUpdateProduct,
  adminUploadImage,
} from './api/adminProductApi';
export { fetchProductById } from './api/fetchProductById';
export { fetchProducts } from './api/fetchProducts';
export type {
  AdminProduct,
  AdminProductCreatePayload,
  AdminProductImageUploadResponse,
  AdminProductUpdatePayload,
  Money,
  ProductAttribute,
  ProductDetails,
  ProductDetailsOffer,
  ProductDetailsOfferSeller,
  ProductListItem,
  ProductListResponse,
  ProductOfferSort,
} from './model/types';
