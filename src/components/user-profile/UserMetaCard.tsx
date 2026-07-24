"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProfile, updateProfile } from "@/store/profileSlice";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector((state: RootState) => state.profile);
  const { updateUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    profileImage: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        profileImage: profile.profileImage || "",
        latitude: profile.latitude !== null ? String(profile.latitude) : "",
        longitude: profile.longitude !== null ? String(profile.longitude) : "",
      });
    }
  }, [profile, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    if (formData.phone) {
      data.append("phone", formData.phone);
    }
    if (selectedFile) {
      data.append("profileImage", selectedFile);
    }

    dispatch(updateProfile(data))
      .unwrap()
      .then((updatedProfile) => {
        updateUser({
          id: updatedProfile.id,
          fullName: updatedProfile.fullName,
          email: updatedProfile.email,
          role: updatedProfile.role,
          profileImage: updatedProfile.profileImage,
        });
        setSelectedFile(null);
      })
      .catch((err) => {
        console.error("Failed to update profile:", err);
      });

    closeModal();
  };

  const getFormattedImageUrl = (url: string | null | undefined) => {
    if (!url) return "/images/logo/logo-icon.svg";
    if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBaseUrl}${cleanUrl}`;
  };

  const fullName = profile?.fullName || "Tuga Trades Admin";
  const role = profile?.role || "System Administrator";

  return (
    <>
      <div className="border border-gray-200 rounded-xl dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden relative">
        {/* Banner Area */}
        <div className="h-32 w-full bg-gradient-to-r from-[#1a2e05] to-[#243d07] dark:from-brand-600 dark:to-brand-800 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-start">
            {/* Avatar overlapping banner */}
            <div className="relative -mt-10 mb-4">
              <div className="w-24 h-24 rounded-xl border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-900 overflow-hidden relative z-10 flex items-center justify-center p-1 shadow-sm">
                <Image
                  width={96}
                  height={96}
                  src={getFormattedImageUrl(profile?.profileImage)}
                  alt="user profile"
                  className="object-cover w-full h-full rounded-xl"
                />
              </div>
              {/* Active Dot */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full z-20 translate-x-1/2 translate-y-1/2 shadow-sm" />
            </div>

            {/* Right side actions / badges */}
            <div className="pt-4 flex flex-wrap justify-end items-center gap-3">
              {/* Role Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-500/20">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {loading && !profile ? "..." : role}
              </div>
              {/* Edit Button */}
              <button
                onClick={openModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-700 transition-colors shadow-sm cursor-pointer"
                title="Edit Profile"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
            </div>
          </div>

          {/* User Details */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {loading && !profile ? "Loading..." : fullName}
            </h4>

            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
              {/* Email */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{profile?.email || "N/A"}</span>
              </div>

              {/* Phone */}
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="custom-scrollbar h-[350px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                {/* Profile Image Edit Preview */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative w-24 h-24 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center p-2">
                    <Image
                      width={80}
                      height={80}
                      src={getFormattedImageUrl(formData.profileImage)}
                      alt="profile preview"
                      className="object-contain w-full h-full rounded-full"
                    />
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-full shadow-theme-xs text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors duration-200">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Full Name</Label>
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Not Provided"
                    />
                  </div>

                  {/* <div className="col-span-2 lg:col-span-1">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 38.7223"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g. -9.1393"
                    />
                  </div> */}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button type="button" size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button type="submit" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
