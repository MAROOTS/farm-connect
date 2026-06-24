import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapPinIcon, CalendarIcon, GlobeAltIcon, PhotoIcon,
    ShoppingCartIcon, ArrowLeftIcon, ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { authApi } from "../api/auth";
import { farmApi } from "../api/farm";
import { marketplaceApi } from "../api/marketplace";
import { useAuthStore } from "../store/authStore";

export default function FarmerProfilePage() {
    const { farmerId } = useParams();
    const navigate      = useNavigate();
    const currentUser   = useAuthStore((s) => s.user);

    const [profile, setProfile]   = useState(null);
    const [farm, setFarm]         = useState(null);
    const [listings, setListings] = useState([]);
    const [rating, setRating]     = useState(null);
    const [loading, setLoading]   = useState(true);

    const isOwnProfile = currentUser?.id === farmerId;

    useEffect(() => {
        async function load() {
            try {
                const results = await Promise.allSettled([
                    authApi.getPublicProfile(farmerId),
                    farmApi.getPublicFarm(farmerId),
                    marketplaceApi.getListingsByFarmer(farmerId),
                    marketplaceApi.getFarmerRating(farmerId),
                ]);
                if (results[0].status === "fulfilled")
                    setProfile(results[0].value.data.data);
                if (results[1].status === "fulfilled")
                    setFarm(results[1].value.data.data);
                if (results[2].status === "fulfilled")
                    setListings(results[2].value.data.data ?? []);
                if (results[3].status === "fulfilled")
                    setRating(results[3].value.data.data);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [farmerId]);

    function goToListing(title) {
        navigate(`/app/marketplace?search=${encodeURIComponent(title)}`);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm text-gray-400">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center
                      h-64 gap-3">
                <GlobeAltIcon className="w-10 h-10 text-gray-300" />
                <p className="text-sm text-gray-400">Farmer not found</p>
                <button onClick={() => navigate(-1)}
                        className="text-xs text-forest-700 font-medium
                           hover:underline flex items-center gap-1">
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                    Go back
                </button>
            </div>
        );
    }

    const memberSince = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-KE", {
            month: "long", year: "numeric"
        })
        : null;

    return (
        <div className="flex flex-col gap-5 max-w-4xl">

            <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs
                         text-gray-400 hover:text-gray-600
                         transition-colors w-fit">
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                Back
            </button>

            <div className="bg-white border border-[#e5e7eb]
                      rounded-[16px] overflow-hidden">

                {/* Cover photo */}
                <div className="h-40 sm:h-52 relative overflow-hidden">
                    {farm?.farmImageUrl ? (
                        <img src={farm.farmImageUrl} alt={farm.farmName}
                             className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br
                            from-forest-700 to-forest-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t
                          from-black/50 via-black/0 to-black/0" />
                </div>

                {/* Profile info */}
                <div className="px-5 sm:px-8 pb-6 pt-0 relative">

                    {/* Avatar */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full
                          bg-forest-100 border-4 border-white
                          flex items-center justify-center
                          -mt-10 sm:-mt-12 relative shrink-0
                          shadow-sm">
                        <p className="text-2xl sm:text-3xl font-bold
                          text-forest-800">
                            {profile.fullName?.charAt(0).toUpperCase()}
                        </p>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row
                          sm:items-end sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-bold text-gray-900">
                                    {profile.fullName}
                                </h1>
                                <span className="text-[11px] font-medium px-2
                                 py-0.5 rounded-full bg-forest-100
                                 text-forest-800">
                  {profile.role}
                </span>
                                {isOwnProfile && (
                                    <span className="text-[11px] font-medium px-2
                                   py-0.5 rounded-full bg-blue-100
                                   text-blue-700">
                    This is you
                  </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-1.5
                              flex-wrap">
                                {farm?.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPinIcon className="w-3.5 h-3.5
                                           text-gray-400" />
                                        <p className="text-xs text-gray-500">
                                            {farm.location}
                                        </p>
                                    </div>
                                )}
                                {memberSince && (
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="w-3.5 h-3.5
                                             text-gray-400" />
                                        <p className="text-xs text-gray-500">
                                            Member since {memberSince}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {rating?.totalReviews > 0 && (
                            <div className="flex items-center gap-2 bg-amber-50
                              px-3 py-2 rounded-[10px] w-fit">
                                <StarIcon className="w-5 h-5 text-amber-400" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900
                                leading-none">
                                        {rating.averageRating}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        {rating.totalReviews} review
                                        {rating.totalReviews > 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-[#e5e7eb]
                        rounded-[10px] p-4 text-center">
                    <p className="text-xl font-bold text-forest-900">
                        {listings.length}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Active listings
                    </p>
                </div>
                <div className="bg-white border border-[#e5e7eb]
                        rounded-[10px] p-4 text-center">
                    <p className="text-xl font-bold text-forest-900">
                        {farm?.sizeInAcres ?? "—"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Acres farmed
                    </p>
                </div>
                <div className="bg-white border border-[#e5e7eb]
                        rounded-[10px] p-4 text-center">
                    <p className="text-xl font-bold text-forest-900">
                        {rating?.averageRating ?? "—"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Average rating
                    </p>
                </div>
            </div>

            {/* Farm details*/}
            {farm ? (
                <div className="bg-white border border-[#e5e7eb]
                        rounded-[12px] p-5">
                    <p className="text-sm font-semibold text-gray-800 mb-3">
                        {farm.farmName}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                        <div>
                            <p className="text-[11px] text-gray-400">Soil type</p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">
                                {farm.soilType || "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400">Size</p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">
                                {farm.sizeInAcres} acres
                            </p>
                        </div>
                    </div>
                    {farm.cropTypes?.length > 0 && (
                        <div>
                            <p className="text-[11px] text-gray-400 mb-1.5">
                                Crops grown
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {farm.cropTypes.map((crop) => (
                                    <span key={crop}
                                          className="text-xs px-2.5 py-1 rounded-full
                                   bg-forest-50 text-forest-700">
                    {crop}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-[#f8f7f4] border border-[#e5e7eb]
                        rounded-[12px] p-5 text-center">
                    <p className="text-sm text-gray-400">
                        This farmer hasn't added farm details yet
                    </p>
                </div>
            )}

            {/*Listings*/}
            <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">
                    {isOwnProfile ? "Your listings" : "Active listings"}
                </p>

                {listings.length === 0 ? (
                    <div className="bg-white border border-[#e5e7eb]
                          rounded-[12px] py-12 flex flex-col
                          items-center gap-2">
                        <ShoppingCartIcon className="w-8 h-8 text-gray-300" />
                        <p className="text-sm text-gray-400">
                            No active listings right now
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-3 gap-4">
                        {listings.map((listing) => (
                            <div key={listing.id}
                                 onClick={() => goToListing(listing.title)}
                                 className="bg-white border border-[#e5e7eb]
                              rounded-[12px] overflow-hidden
                              hover:border-forest-200 cursor-pointer
                              transition-colors">
                                <div className="aspect-[4/3] bg-[#f0efec]
                                overflow-hidden">
                                    {listing.imageUrls?.[0] || listing.imageUrl ? (
                                        <img src={listing.imageUrls?.[0] || listing.imageUrl}
                                             alt={listing.title}
                                             className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center
                                    justify-center">
                                            <PhotoIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium text-gray-800
                                truncate">
                                        {listing.title}
                                    </p>
                                    <div className="flex items-center justify-between
                                  mt-1">
                                        <p className="text-xs font-semibold
                                 text-forest-900">
                                            KES {listing.pricePerUnit}/{listing.unit}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {listing.quantityAvailable} {listing.unit} left
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}