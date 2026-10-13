import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

import { RootLayout } from "@/layouts/RootLayout";
import { ROUTES } from "@/config/app";

// Pages are code-split so the first paint only ships the shell and the home page
// (03-code-standards.md §5: lazy-load routes).
const HomePage = lazy(async () => import("@/pages/HomePage"));
const NotFoundPage = lazy(async () => import("@/pages/NotFoundPage"));
const ShopPage = lazy(async () => import("@/pages/ShopPage"));
const CategoryPage = lazy(async () => import("@/pages/CategoryPage"));
const SearchPage = lazy(async () => import("@/pages/SearchPage"));
const ProductPage = lazy(async () => import("@/pages/ProductPage"));
const CartPage = lazy(async () => import("@/pages/CartPage"));
const CheckoutPage = lazy(async () => import("@/pages/CheckoutPage"));
const OrderSuccessPage = lazy(async () => import("@/pages/OrderSuccessPage"));
const TrackOrderPage = lazy(async () => import("@/pages/TrackOrderPage"));
const LoginPage = lazy(async () => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(async () => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(async () => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(async () => import("@/pages/auth/ResetPasswordPage"));
const PlaceholderPage = lazy(async () => import("@/pages/PlaceholderPage"));

export function AppRoutes() {
  return (
    <RootLayout>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />

        {/*
          Routes for phases F3–F6. They render one shared placeholder so navigation from the navbar
          works today without inventing page content before its phase.
        */}
        <Route path={ROUTES.shop} element={<ShopPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path={ROUTES.search} element={<SearchPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path={ROUTES.cart} element={<CartPage />} />
        <Route path={ROUTES.checkout} element={<CheckoutPage />} />
        <Route path="/order/success/:id" element={<OrderSuccessPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />

        {/* Auth (F6.1). The account pages below are F6.2 and stay placeholders for now. */}
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route path={ROUTES.account} element={<PlaceholderPage phase="F6" />} />
        <Route path="/account/orders" element={<PlaceholderPage phase="F6" />} />
        <Route path="/wishlist" element={<PlaceholderPage phase="F6" />} />
        <Route path="/about" element={<PlaceholderPage phase="F7" />} />
        <Route path="/contact" element={<PlaceholderPage phase="F7" />} />
        <Route path="/faq" element={<PlaceholderPage phase="F7" />} />
        <Route path="/shipping" element={<PlaceholderPage phase="F7" />} />
        <Route path="/returns" element={<PlaceholderPage phase="F7" />} />
        <Route path="/privacy" element={<PlaceholderPage phase="F7" />} />
        <Route path="/terms" element={<PlaceholderPage phase="F7" />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </RootLayout>
  );
}
