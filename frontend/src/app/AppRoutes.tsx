import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RootLayout } from "@/layouts/RootLayout";
import { AccountLayout } from "@/pages/account/AccountLayout";
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
const AccountDashboardPage = lazy(async () => import("@/pages/account/AccountDashboardPage"));
const ProfilePage = lazy(async () => import("@/pages/account/ProfilePage"));
const PasswordPage = lazy(async () => import("@/pages/account/PasswordPage"));
const OrdersPage = lazy(async () => import("@/pages/account/OrdersPage"));
const OrderDetailsPage = lazy(async () => import("@/pages/account/OrderDetailsPage"));
const WishlistPage = lazy(async () => import("@/pages/account/WishlistPage"));
const AddressesPage = lazy(async () => import("@/pages/account/AddressesPage"));
const NotificationsPage = lazy(async () => import("@/pages/account/NotificationsPage"));
const AboutPage = lazy(async () => import("@/pages/static/AboutPage"));
const ContactPage = lazy(async () => import("@/pages/static/ContactPage"));
const FaqPage = lazy(async () => import("@/pages/static/FaqPage"));
const ShippingPage = lazy(async () => import("@/pages/static/ShippingPage"));
const ReturnsPage = lazy(async () => import("@/pages/static/ReturnsPage"));
const PrivacyPage = lazy(async () => import("@/pages/static/PrivacyPage"));
const TermsPage = lazy(async () => import("@/pages/static/TermsPage"));

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

        {/* Auth (F6.1). */}
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/*
          Account (F6.2, extended in F6.3). The layout renders the sidebar and `<Outlet/>`; every
          child is behind `ProtectedRoute`. `/wishlist` is an alias of the account wishlist so the
          navbar heart keeps working.
        */}
        <Route
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.account} element={<AccountDashboardPage />} />
          <Route path={ROUTES.accountProfile} element={<ProfilePage />} />
          <Route path={ROUTES.accountPassword} element={<PasswordPage />} />
          <Route path={ROUTES.accountOrders} element={<OrdersPage />} />
          <Route path={ROUTES.accountOrderDetails(":id")} element={<OrderDetailsPage />} />
          <Route path={ROUTES.accountWishlist} element={<WishlistPage />} />
          <Route path={ROUTES.accountAddresses} element={<AddressesPage />} />
          <Route path={ROUTES.accountNotifications} element={<NotificationsPage />} />
          <Route path={ROUTES.wishlist} element={<WishlistPage />} />
        </Route>

        {/* Static pages (F7.1a + F7.1b). */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </RootLayout>
  );
}
