"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search, X, MapPin, Mail, ExternalLink,
  Heart, Shield, Users, TrendingUp, MessageCircle, Clapperboard, FileText,
  Venus, Star, Globe2, Building2, Phone, Camera, Plane,
  Utensils, Car, Coffee, Dumbbell,
  ChevronDown, ArrowUp, ArrowDown,
  ListPlus, Plus, Check, SlidersHorizontal,
} from "lucide-react";
import {
  FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaSnapchatGhost,
} from "react-icons/fa";
import { creatorsData, type Creator } from "@/models/creators.data";
import { useAuth } from "@/providers/auth.provider";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { useDummyData } from "@/providers/dummy-data.provider";
import { fetchSavedCreators, saveCreator, unsaveCreator, fetchLists, createList, addCreatorToList, type CreatorList } from "@/services";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListsPanel } from "@/app/(platform)/dashboard/lists/page";
import { mockLists } from "@/lib/mock-lists";
import { CreatorAvatar } from "@/components/creators/creator-avatar";
import { toast } from "@/hooks/use-toast";

// ─── constants ───────────────────────────────────────────────────────────────

const FOLLOWER_RANGES = [
  { label: "All Followers", value: "all", min: 0, max: Infinity },
  { label: "0 - 20k", value: "0-20k", min: 0, max: 20_000 },
  { label: "20k - 50k", value: "20k-50k", min: 20_000, max: 50_000 },
  { label: "50k - 200k", value: "50k-200k", min: 50_000, max: 200_000 },
  { label: "200k - 500k", value: "200k-500k", min: 200_000, max: 500_000 },
  { label: "500k - 1M", value: "500k-1m", min: 500_000, max: 1_000_000 },
  { label: "1M+", value: "1m+", min: 1_000_000, max: Infinity },
] as const;

const PLATFORM_CATEGORIES = ["Couples", "Family", "Educational", "Comedy", "Lifestyle", "Indian", "Emirati", "GCC", "Asian"];

const ER_RANGES = [
  { label: "Any", value: "any" },
  { label: "≥0.5%", value: "0.5" },
  { label: "≥1%", value: "1" },
  { label: "≥2%", value: "2" },
  { label: "≥3%", value: "3" },
  { label: "≥4%", value: "4" },
  { label: "≥5%", value: "5" },
  { label: "≥6%", value: "6" },
  { label: "≥7%", value: "7" },
  { label: "≥8%", value: "8" },
  { label: "≥9%", value: "9" },
  { label: "≥10%", value: "10" },
] as const;

const LOCATIONS = [
  { label: "Afghanistan", flag: "🇦🇫", keywords: ["afghanistan", "islamic republic of afghanistan"] },
  { label: "Albania", flag: "🇦🇱", keywords: ["albania", "republic of albania"] },
  { label: "Algeria", flag: "🇩🇿", keywords: ["algeria", "people's democratic republic of algeria"] },
  { label: "American Samoa", flag: "🇦🇸", keywords: ["american samoa"] },
  { label: "Andorra", flag: "🇦🇩", keywords: ["andorra", "principality of andorra"] },
  { label: "Angola", flag: "🇦🇴", keywords: ["angola", "republic of angola"] },
  { label: "Anguilla", flag: "🇦🇮", keywords: ["anguilla"] },
  { label: "Antarctica", flag: "🇦🇶", keywords: ["antarctica"] },
  { label: "Antigua and Barbuda", flag: "🇦🇬", keywords: ["antigua and barbuda"] },
  { label: "Argentina", flag: "🇦🇷", keywords: ["argentina", "argentine republic"] },
  { label: "Armenia", flag: "🇦🇲", keywords: ["armenia", "republic of armenia"] },
  { label: "Aruba", flag: "🇦🇼", keywords: ["aruba"] },
  { label: "Australia", flag: "🇦🇺", keywords: ["australia"] },
  { label: "Austria", flag: "🇦🇹", keywords: ["austria", "republic of austria"] },
  { label: "Azerbaijan", flag: "🇦🇿", keywords: ["azerbaijan", "republic of azerbaijan"] },
  { label: "Bahamas", flag: "🇧🇸", keywords: ["bahamas", "commonwealth of the bahamas"] },
  { label: "Bahrain", flag: "🇧🇭", keywords: ["bahrain", "kingdom of bahrain"] },
  { label: "Bangladesh", flag: "🇧🇩", keywords: ["bangladesh", "people's republic of bangladesh"] },
  { label: "Barbados", flag: "🇧🇧", keywords: ["barbados"] },
  { label: "Belarus", flag: "🇧🇾", keywords: ["belarus", "republic of belarus"] },
  { label: "Belgium", flag: "🇧🇪", keywords: ["belgium", "kingdom of belgium"] },
  { label: "Belize", flag: "🇧🇿", keywords: ["belize"] },
  { label: "Benin", flag: "🇧🇯", keywords: ["benin", "republic of benin"] },
  { label: "Bermuda", flag: "🇧🇲", keywords: ["bermuda"] },
  { label: "Bhutan", flag: "🇧🇹", keywords: ["bhutan", "kingdom of bhutan"] },
  { label: "Bolivia, Plurinational State of", flag: "🇧🇴", keywords: ["bolivia, plurinational state of", "bolivia", "plurinational state of bolivia"] },
  { label: "Bonaire, Sint Eustatius and Saba", flag: "🇧🇶", keywords: ["bonaire, sint eustatius and saba"] },
  { label: "Bosnia and Herzegovina", flag: "🇧🇦", keywords: ["bosnia and herzegovina", "republic of bosnia and herzegovina"] },
  { label: "Botswana", flag: "🇧🇼", keywords: ["botswana", "republic of botswana"] },
  { label: "Bouvet Island", flag: "🇧🇻", keywords: ["bouvet island"] },
  { label: "Brazil", flag: "🇧🇷", keywords: ["brazil", "federative republic of brazil"] },
  { label: "British Indian Ocean Territory", flag: "🇮🇴", keywords: ["british indian ocean territory"] },
  { label: "Brunei Darussalam", flag: "🇧🇳", keywords: ["brunei darussalam"] },
  { label: "Bulgaria", flag: "🇧🇬", keywords: ["bulgaria", "republic of bulgaria"] },
  { label: "Burkina Faso", flag: "🇧🇫", keywords: ["burkina faso"] },
  { label: "Burundi", flag: "🇧🇮", keywords: ["burundi", "republic of burundi"] },
  { label: "Cabo Verde", flag: "🇨🇻", keywords: ["cabo verde", "republic of cabo verde"] },
  { label: "Cambodia", flag: "🇰🇭", keywords: ["cambodia", "kingdom of cambodia"] },
  { label: "Cameroon", flag: "🇨🇲", keywords: ["cameroon", "republic of cameroon"] },
  { label: "Canada", flag: "🇨🇦", keywords: ["canada"] },
  { label: "Cayman Islands", flag: "🇰🇾", keywords: ["cayman islands"] },
  { label: "Central African Republic", flag: "🇨🇫", keywords: ["central african republic"] },
  { label: "Chad", flag: "🇹🇩", keywords: ["chad", "republic of chad"] },
  { label: "Chile", flag: "🇨🇱", keywords: ["chile", "republic of chile"] },
  { label: "China", flag: "🇨🇳", keywords: ["china", "people's republic of china"] },
  { label: "Christmas Island", flag: "🇨🇽", keywords: ["christmas island"] },
  { label: "Cocos (Keeling) Islands", flag: "🇨🇨", keywords: ["cocos (keeling) islands"] },
  { label: "Colombia", flag: "🇨🇴", keywords: ["colombia", "republic of colombia"] },
  { label: "Comoros", flag: "🇰🇲", keywords: ["comoros", "union of the comoros"] },
  { label: "Congo", flag: "🇨🇬", keywords: ["congo", "republic of the congo"] },
  { label: "Congo, The Democratic Republic of the", flag: "🇨🇩", keywords: ["congo, the democratic republic of the"] },
  { label: "Cook Islands", flag: "🇨🇰", keywords: ["cook islands"] },
  { label: "Costa Rica", flag: "🇨🇷", keywords: ["costa rica", "republic of costa rica"] },
  { label: "Croatia", flag: "🇭🇷", keywords: ["croatia", "republic of croatia"] },
  { label: "Cuba", flag: "🇨🇺", keywords: ["cuba", "republic of cuba"] },
  { label: "Curaçao", flag: "🇨🇼", keywords: ["curaçao"] },
  { label: "Cyprus", flag: "🇨🇾", keywords: ["cyprus", "republic of cyprus"] },
  { label: "Czechia", flag: "🇨🇿", keywords: ["czechia", "czech republic"] },
  { label: "Côte d'Ivoire", flag: "🇨🇮", keywords: ["côte d'ivoire", "republic of côte d'ivoire"] },
  { label: "Denmark", flag: "🇩🇰", keywords: ["denmark", "kingdom of denmark"] },
  { label: "Djibouti", flag: "🇩🇯", keywords: ["djibouti", "republic of djibouti"] },
  { label: "Dominica", flag: "🇩🇲", keywords: ["dominica", "commonwealth of dominica"] },
  { label: "Dominican Republic", flag: "🇩🇴", keywords: ["dominican republic"] },
  { label: "Ecuador", flag: "🇪🇨", keywords: ["ecuador", "republic of ecuador"] },
  { label: "Egypt", flag: "🇪🇬", keywords: ["egypt", "arab republic of egypt"] },
  { label: "El Salvador", flag: "🇸🇻", keywords: ["el salvador", "republic of el salvador"] },
  { label: "Equatorial Guinea", flag: "🇬🇶", keywords: ["equatorial guinea", "republic of equatorial guinea"] },
  { label: "Eritrea", flag: "🇪🇷", keywords: ["eritrea", "the state of eritrea"] },
  { label: "Estonia", flag: "🇪🇪", keywords: ["estonia", "republic of estonia"] },
  { label: "Eswatini", flag: "🇸🇿", keywords: ["eswatini", "kingdom of eswatini"] },
  { label: "Ethiopia", flag: "🇪🇹", keywords: ["ethiopia", "federal democratic republic of ethiopia"] },
  { label: "Falkland Islands (Malvinas)", flag: "🇫🇰", keywords: ["falkland islands (malvinas)"] },
  { label: "Faroe Islands", flag: "🇫🇴", keywords: ["faroe islands"] },
  { label: "Fiji", flag: "🇫🇯", keywords: ["fiji", "republic of fiji"] },
  { label: "Finland", flag: "🇫🇮", keywords: ["finland", "republic of finland"] },
  { label: "France", flag: "🇫🇷", keywords: ["france", "french republic"] },
  { label: "French Guiana", flag: "🇬🇫", keywords: ["french guiana"] },
  { label: "French Polynesia", flag: "🇵🇫", keywords: ["french polynesia"] },
  { label: "French Southern Territories", flag: "🇹🇫", keywords: ["french southern territories"] },
  { label: "Gabon", flag: "🇬🇦", keywords: ["gabon", "gabonese republic"] },
  { label: "Gambia", flag: "🇬🇲", keywords: ["gambia", "republic of the gambia"] },
  { label: "Georgia", flag: "🇬🇪", keywords: ["georgia"] },
  { label: "Germany", flag: "🇩🇪", keywords: ["germany", "federal republic of germany"] },
  { label: "Ghana", flag: "🇬🇭", keywords: ["ghana", "republic of ghana"] },
  { label: "Gibraltar", flag: "🇬🇮", keywords: ["gibraltar"] },
  { label: "Greece", flag: "🇬🇷", keywords: ["greece", "hellenic republic"] },
  { label: "Greenland", flag: "🇬🇱", keywords: ["greenland"] },
  { label: "Grenada", flag: "🇬🇩", keywords: ["grenada"] },
  { label: "Guadeloupe", flag: "🇬🇵", keywords: ["guadeloupe"] },
  { label: "Guam", flag: "🇬🇺", keywords: ["guam"] },
  { label: "Guatemala", flag: "🇬🇹", keywords: ["guatemala", "republic of guatemala"] },
  { label: "Guernsey", flag: "🇬🇬", keywords: ["guernsey"] },
  { label: "Guinea", flag: "🇬🇳", keywords: ["guinea", "republic of guinea"] },
  { label: "Guinea-Bissau", flag: "🇬🇼", keywords: ["guinea-bissau", "republic of guinea-bissau"] },
  { label: "Guyana", flag: "🇬🇾", keywords: ["guyana", "republic of guyana"] },
  { label: "Haiti", flag: "🇭🇹", keywords: ["haiti", "republic of haiti"] },
  { label: "Heard Island and McDonald Islands", flag: "🇭🇲", keywords: ["heard island and mcdonald islands"] },
  { label: "Holy See (Vatican City State)", flag: "🇻🇦", keywords: ["holy see (vatican city state)"] },
  { label: "Honduras", flag: "🇭🇳", keywords: ["honduras", "republic of honduras"] },
  { label: "Hong Kong", flag: "🇭🇰", keywords: ["hong kong", "hong kong special administrative region of china"] },
  { label: "Hungary", flag: "🇭🇺", keywords: ["hungary"] },
  { label: "Iceland", flag: "🇮🇸", keywords: ["iceland", "republic of iceland"] },
  { label: "India", flag: "🇮🇳", keywords: ["india", "republic of india"] },
  { label: "Indonesia", flag: "🇮🇩", keywords: ["indonesia", "republic of indonesia"] },
  { label: "Iran, Islamic Republic of", flag: "🇮🇷", keywords: ["iran, islamic republic of", "iran", "islamic republic of iran"] },
  { label: "Iraq", flag: "🇮🇶", keywords: ["iraq", "republic of iraq"] },
  { label: "Ireland", flag: "🇮🇪", keywords: ["ireland"] },
  { label: "Isle of Man", flag: "🇮🇲", keywords: ["isle of man"] },
  { label: "Israel", flag: "🇮🇱", keywords: ["israel", "state of israel"] },
  { label: "Italy", flag: "🇮🇹", keywords: ["italy", "italian republic"] },
  { label: "Jamaica", flag: "🇯🇲", keywords: ["jamaica"] },
  { label: "Japan", flag: "🇯🇵", keywords: ["japan"] },
  { label: "Jersey", flag: "🇯🇪", keywords: ["jersey"] },
  { label: "Jordan", flag: "🇯🇴", keywords: ["jordan", "hashemite kingdom of jordan"] },
  { label: "Kazakhstan", flag: "🇰🇿", keywords: ["kazakhstan", "republic of kazakhstan"] },
  { label: "Kenya", flag: "🇰🇪", keywords: ["kenya", "republic of kenya"] },
  { label: "Kiribati", flag: "🇰🇮", keywords: ["kiribati", "republic of kiribati"] },
  { label: "Korea, Democratic People's Republic of", flag: "🇰🇵", keywords: ["korea, democratic people's republic of", "north korea", "democratic people's republic of korea"] },
  { label: "Korea, Republic of", flag: "🇰🇷", keywords: ["korea, republic of", "south korea"] },
  { label: "Kuwait", flag: "🇰🇼", keywords: ["kuwait", "state of kuwait"] },
  { label: "Kyrgyzstan", flag: "🇰🇬", keywords: ["kyrgyzstan", "kyrgyz republic"] },
  { label: "Lao People's Democratic Republic", flag: "🇱🇦", keywords: ["lao people's democratic republic", "laos"] },
  { label: "Latvia", flag: "🇱🇻", keywords: ["latvia", "republic of latvia"] },
  { label: "Lebanon", flag: "🇱🇧", keywords: ["lebanon", "lebanese republic"] },
  { label: "Lesotho", flag: "🇱🇸", keywords: ["lesotho", "kingdom of lesotho"] },
  { label: "Liberia", flag: "🇱🇷", keywords: ["liberia", "republic of liberia"] },
  { label: "Libya", flag: "🇱🇾", keywords: ["libya"] },
  { label: "Liechtenstein", flag: "🇱🇮", keywords: ["liechtenstein", "principality of liechtenstein"] },
  { label: "Lithuania", flag: "🇱🇹", keywords: ["lithuania", "republic of lithuania"] },
  { label: "Luxembourg", flag: "🇱🇺", keywords: ["luxembourg", "grand duchy of luxembourg"] },
  { label: "Macao", flag: "🇲🇴", keywords: ["macao", "macao special administrative region of china"] },
  { label: "Madagascar", flag: "🇲🇬", keywords: ["madagascar", "republic of madagascar"] },
  { label: "Malawi", flag: "🇲🇼", keywords: ["malawi", "republic of malawi"] },
  { label: "Malaysia", flag: "🇲🇾", keywords: ["malaysia"] },
  { label: "Maldives", flag: "🇲🇻", keywords: ["maldives", "republic of maldives"] },
  { label: "Mali", flag: "🇲🇱", keywords: ["mali", "republic of mali"] },
  { label: "Malta", flag: "🇲🇹", keywords: ["malta", "republic of malta"] },
  { label: "Marshall Islands", flag: "🇲🇭", keywords: ["marshall islands", "republic of the marshall islands"] },
  { label: "Martinique", flag: "🇲🇶", keywords: ["martinique"] },
  { label: "Mauritania", flag: "🇲🇷", keywords: ["mauritania", "islamic republic of mauritania"] },
  { label: "Mauritius", flag: "🇲🇺", keywords: ["mauritius", "republic of mauritius"] },
  { label: "Mayotte", flag: "🇾🇹", keywords: ["mayotte"] },
  { label: "Mexico", flag: "🇲🇽", keywords: ["mexico", "united mexican states"] },
  { label: "Micronesia, Federated States of", flag: "🇫🇲", keywords: ["micronesia, federated states of", "federated states of micronesia"] },
  { label: "Moldova, Republic of", flag: "🇲🇩", keywords: ["moldova, republic of", "moldova", "republic of moldova"] },
  { label: "Monaco", flag: "🇲🇨", keywords: ["monaco", "principality of monaco"] },
  { label: "Mongolia", flag: "🇲🇳", keywords: ["mongolia"] },
  { label: "Montenegro", flag: "🇲🇪", keywords: ["montenegro"] },
  { label: "Montserrat", flag: "🇲🇸", keywords: ["montserrat"] },
  { label: "Morocco", flag: "🇲🇦", keywords: ["morocco", "kingdom of morocco"] },
  { label: "Mozambique", flag: "🇲🇿", keywords: ["mozambique", "republic of mozambique"] },
  { label: "Myanmar", flag: "🇲🇲", keywords: ["myanmar", "republic of myanmar"] },
  { label: "Namibia", flag: "🇳🇦", keywords: ["namibia", "republic of namibia"] },
  { label: "Nauru", flag: "🇳🇷", keywords: ["nauru", "republic of nauru"] },
  { label: "Nepal", flag: "🇳🇵", keywords: ["nepal", "federal democratic republic of nepal"] },
  { label: "Netherlands", flag: "🇳🇱", keywords: ["netherlands", "kingdom of the netherlands"] },
  { label: "New Caledonia", flag: "🇳🇨", keywords: ["new caledonia"] },
  { label: "New Zealand", flag: "🇳🇿", keywords: ["new zealand"] },
  { label: "Nicaragua", flag: "🇳🇮", keywords: ["nicaragua", "republic of nicaragua"] },
  { label: "Niger", flag: "🇳🇪", keywords: ["niger", "republic of the niger"] },
  { label: "Nigeria", flag: "🇳🇬", keywords: ["nigeria", "federal republic of nigeria"] },
  { label: "Niue", flag: "🇳🇺", keywords: ["niue"] },
  { label: "Norfolk Island", flag: "🇳🇫", keywords: ["norfolk island"] },
  { label: "North Macedonia", flag: "🇲🇰", keywords: ["north macedonia", "republic of north macedonia"] },
  { label: "Northern Mariana Islands", flag: "🇲🇵", keywords: ["northern mariana islands", "commonwealth of the northern mariana islands"] },
  { label: "Norway", flag: "🇳🇴", keywords: ["norway", "kingdom of norway"] },
  { label: "Oman", flag: "🇴🇲", keywords: ["oman", "sultanate of oman"] },
  { label: "Pakistan", flag: "🇵🇰", keywords: ["pakistan", "islamic republic of pakistan"] },
  { label: "Palau", flag: "🇵🇼", keywords: ["palau", "republic of palau"] },
  { label: "Palestine, State of", flag: "🇵🇸", keywords: ["palestine, state of", "the state of palestine"] },
  { label: "Panama", flag: "🇵🇦", keywords: ["panama", "republic of panama"] },
  { label: "Papua New Guinea", flag: "🇵🇬", keywords: ["papua new guinea", "independent state of papua new guinea"] },
  { label: "Paraguay", flag: "🇵🇾", keywords: ["paraguay", "republic of paraguay"] },
  { label: "Peru", flag: "🇵🇪", keywords: ["peru", "republic of peru"] },
  { label: "Philippines", flag: "🇵🇭", keywords: ["philippines", "republic of the philippines"] },
  { label: "Pitcairn", flag: "🇵🇳", keywords: ["pitcairn"] },
  { label: "Poland", flag: "🇵🇱", keywords: ["poland", "republic of poland"] },
  { label: "Portugal", flag: "🇵🇹", keywords: ["portugal", "portuguese republic"] },
  { label: "Puerto Rico", flag: "🇵🇷", keywords: ["puerto rico"] },
  { label: "Qatar", flag: "🇶🇦", keywords: ["qatar", "state of qatar"] },
  { label: "Romania", flag: "🇷🇴", keywords: ["romania"] },
  { label: "Russian Federation", flag: "🇷🇺", keywords: ["russian federation"] },
  { label: "Rwanda", flag: "🇷🇼", keywords: ["rwanda", "rwandese republic"] },
  { label: "Réunion", flag: "🇷🇪", keywords: ["réunion"] },
  { label: "Saint Barthélemy", flag: "🇧🇱", keywords: ["saint barthélemy"] },
  { label: "Saint Helena, Ascension and Tristan da Cunha", flag: "🇸🇭", keywords: ["saint helena, ascension and tristan da cunha"] },
  { label: "Saint Kitts and Nevis", flag: "🇰🇳", keywords: ["saint kitts and nevis"] },
  { label: "Saint Lucia", flag: "🇱🇨", keywords: ["saint lucia"] },
  { label: "Saint Martin (French part)", flag: "🇲🇫", keywords: ["saint martin (french part)"] },
  { label: "Saint Pierre and Miquelon", flag: "🇵🇲", keywords: ["saint pierre and miquelon"] },
  { label: "Saint Vincent and the Grenadines", flag: "🇻🇨", keywords: ["saint vincent and the grenadines"] },
  { label: "Samoa", flag: "🇼🇸", keywords: ["samoa", "independent state of samoa"] },
  { label: "San Marino", flag: "🇸🇲", keywords: ["san marino", "republic of san marino"] },
  { label: "Sao Tome and Principe", flag: "🇸🇹", keywords: ["sao tome and principe", "democratic republic of sao tome and principe"] },
  { label: "Saudi Arabia", flag: "🇸🇦", keywords: ["saudi arabia", "kingdom of saudi arabia"] },
  { label: "Senegal", flag: "🇸🇳", keywords: ["senegal", "republic of senegal"] },
  { label: "Serbia", flag: "🇷🇸", keywords: ["serbia", "republic of serbia"] },
  { label: "Seychelles", flag: "🇸🇨", keywords: ["seychelles", "republic of seychelles"] },
  { label: "Sierra Leone", flag: "🇸🇱", keywords: ["sierra leone", "republic of sierra leone"] },
  { label: "Singapore", flag: "🇸🇬", keywords: ["singapore", "republic of singapore"] },
  { label: "Sint Maarten (Dutch part)", flag: "🇸🇽", keywords: ["sint maarten (dutch part)"] },
  { label: "Slovakia", flag: "🇸🇰", keywords: ["slovakia", "slovak republic"] },
  { label: "Slovenia", flag: "🇸🇮", keywords: ["slovenia", "republic of slovenia"] },
  { label: "Solomon Islands", flag: "🇸🇧", keywords: ["solomon islands"] },
  { label: "Somalia", flag: "🇸🇴", keywords: ["somalia", "federal republic of somalia"] },
  { label: "South Africa", flag: "🇿🇦", keywords: ["south africa", "republic of south africa"] },
  { label: "South Georgia and the South Sandwich Islands", flag: "🇬🇸", keywords: ["south georgia and the south sandwich islands"] },
  { label: "South Sudan", flag: "🇸🇸", keywords: ["south sudan", "republic of south sudan"] },
  { label: "Spain", flag: "🇪🇸", keywords: ["spain", "kingdom of spain"] },
  { label: "Sri Lanka", flag: "🇱🇰", keywords: ["sri lanka", "democratic socialist republic of sri lanka"] },
  { label: "Sudan", flag: "🇸🇩", keywords: ["sudan", "republic of the sudan"] },
  { label: "Suriname", flag: "🇸🇷", keywords: ["suriname", "republic of suriname"] },
  { label: "Svalbard and Jan Mayen", flag: "🇸🇯", keywords: ["svalbard and jan mayen"] },
  { label: "Sweden", flag: "🇸🇪", keywords: ["sweden", "kingdom of sweden"] },
  { label: "Switzerland", flag: "🇨🇭", keywords: ["switzerland", "swiss confederation"] },
  { label: "Syrian Arab Republic", flag: "🇸🇾", keywords: ["syrian arab republic", "syria"] },
  { label: "Taiwan, Province of China", flag: "🇹🇼", keywords: ["taiwan, province of china", "taiwan"] },
  { label: "Tajikistan", flag: "🇹🇯", keywords: ["tajikistan", "republic of tajikistan"] },
  { label: "Tanzania, United Republic of", flag: "🇹🇿", keywords: ["tanzania, united republic of", "tanzania", "united republic of tanzania"] },
  { label: "Thailand", flag: "🇹🇭", keywords: ["thailand", "kingdom of thailand"] },
  { label: "Timor-Leste", flag: "🇹🇱", keywords: ["timor-leste", "democratic republic of timor-leste"] },
  { label: "Togo", flag: "🇹🇬", keywords: ["togo", "togolese republic"] },
  { label: "Tokelau", flag: "🇹🇰", keywords: ["tokelau"] },
  { label: "Tonga", flag: "🇹🇴", keywords: ["tonga", "kingdom of tonga"] },
  { label: "Trinidad and Tobago", flag: "🇹🇹", keywords: ["trinidad and tobago", "republic of trinidad and tobago"] },
  { label: "Tunisia", flag: "🇹🇳", keywords: ["tunisia", "republic of tunisia"] },
  { label: "Turkmenistan", flag: "🇹🇲", keywords: ["turkmenistan"] },
  { label: "Turks and Caicos Islands", flag: "🇹🇨", keywords: ["turks and caicos islands"] },
  { label: "Tuvalu", flag: "🇹🇻", keywords: ["tuvalu"] },
  { label: "Türkiye", flag: "🇹🇷", keywords: ["türkiye", "republic of türkiye"] },
  { label: "Uganda", flag: "🇺🇬", keywords: ["uganda", "republic of uganda"] },
  { label: "Ukraine", flag: "🇺🇦", keywords: ["ukraine"] },
  { label: "United Arab Emirates", flag: "🇦🇪", keywords: ["uae", "dubai", "abu dhabi", "sharjah", "united arab emirates"] },
  { label: "United Kingdom", flag: "🇬🇧", keywords: ["uk", "britain", "england", "scotland", "wales", "united kingdom"] },
  { label: "United States", flag: "🇺🇸", keywords: ["usa", "us", "united states"] },
  { label: "United States Minor Outlying Islands", flag: "🇺🇲", keywords: ["united states minor outlying islands"] },
  { label: "Uruguay", flag: "🇺🇾", keywords: ["uruguay", "eastern republic of uruguay"] },
  { label: "Uzbekistan", flag: "🇺🇿", keywords: ["uzbekistan", "republic of uzbekistan"] },
  { label: "Vanuatu", flag: "🇻🇺", keywords: ["vanuatu", "republic of vanuatu"] },
  { label: "Venezuela, Bolivarian Republic of", flag: "🇻🇪", keywords: ["venezuela, bolivarian republic of", "venezuela", "bolivarian republic of venezuela"] },
  { label: "Viet Nam", flag: "🇻🇳", keywords: ["viet nam", "vietnam", "socialist republic of viet nam"] },
  { label: "Virgin Islands, British", flag: "🇻🇬", keywords: ["virgin islands, british", "british virgin islands"] },
  { label: "Virgin Islands, U.S.", flag: "🇻🇮", keywords: ["virgin islands, u.s.", "virgin islands of the united states"] },
  { label: "Wallis and Futuna", flag: "🇼🇫", keywords: ["wallis and futuna"] },
  { label: "Western Sahara", flag: "🇪🇭", keywords: ["western sahara"] },
  { label: "Yemen", flag: "🇾🇪", keywords: ["yemen", "republic of yemen"] },
  { label: "Zambia", flag: "🇿🇲", keywords: ["zambia", "republic of zambia"] },
  { label: "Zimbabwe", flag: "🇿🇼", keywords: ["zimbabwe", "republic of zimbabwe"] },
  { label: "Åland Islands", flag: "🇦🇽", keywords: ["åland islands"] },
];


const LANGUAGES = [
  "Any",
  "Arabic", "Bengali", "Bulgarian", "Chinese (Simplified)", "Chinese (Traditional)",
  "Croatian", "Czech", "Danish", "Dutch", "English", "Estonian",
  "Filipino", "Finnish", "French", "German", "Greek", "Hebrew",
  "Hindi", "Hungarian", "Indonesian", "Italian", "Japanese",
  "Korean", "Latvian", "Lithuanian", "Malay", "Norwegian",
  "Persian", "Polish", "Portuguese", "Romanian", "Russian",
  "Serbian", "Slovak", "Slovenian", "Spanish", "Swahili",
  "Swedish", "Thai", "Turkish", "Ukrainian", "Urdu",
  "Vietnamese",
] as const;

const AGE_BRACKETS = ["Any", "18", "25", "35", "45", "65"] as const;

const GENDERS = [
  { label: "Any", value: "any" },
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Female or male", value: "any_gender" },
  { label: "Gender neutral", value: "neutral" },
] as const;

// Deterministic category assignment per creator
function assignCategories(username: string): string[] {
  const h = username.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const c1 = PLATFORM_CATEGORIES[h % PLATFORM_CATEGORIES.length];
  const c2 = PLATFORM_CATEGORIES[(h * 13 + 5) % PLATFORM_CATEGORIES.length];
  return c1 === c2 ? [c1] : [c1, c2];
}

// Pre-compute categories for each creator so we don't re-run on every filter
const creatorsWithCategories = creatorsData.map((c) => ({
  ...c,
  categories: assignCategories(c.username),
}));

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

const INTEREST_MAP: Record<string, string> = {
  "Clothes, Shoes, Handbags & Accessories": "Fashion",
  "Restaurants, Food & Grocery": "Food & Dining",
  "Friends, Family & Relationships": "Family",
  "Travel, Tourism & Aviation": "Travel",
  "Camera & Photography": "Photography",
  "Beauty & Cosmetics": "Beauty",
  "Toys, Children & Baby": "Parenting",
  "Electronics & Computers": "Tech",
  "Coffee, Tea & Beverages": "Beverages",
  "Fitness & Yoga": "Fitness",
  "Television & Film": "TV & Film",
  "Cars & Motorbikes": "Cars",
  "Luxury Goods": "Luxury",
  "Healthy Lifestyle": "Health",
};
const shortInt = (n: string) => INTEREST_MAP[n] || n;

// ─── Platform Icon helper ─────────────────────────────────────────────────────

function PlatformIcon({ platform, size = "sm" }: { platform: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  if (platform === "instagram") return <FaInstagram className={`${cls} text-current`} />;
  if (platform === "youtube") return <FaYoutube className={`${cls} text-current`} />;
  if (platform === "tiktok") return <FaTiktok className={`${cls} text-current`} />;
  if (platform === "facebook") return <FaFacebook className={`${cls} text-current`} />;
  if (platform === "snapchat") return <FaSnapchatGhost className={`${cls} text-current`} />;
  // X / Twitter
  if (platform === "twitter") return (
    <svg className={`${cls} text-current`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
  return null;
}

function creatorPlatforms(c: Creator): string[] {
  const plats: string[] = [];
  if (c.instagram) plats.push("instagram");
  if (c.youtube) plats.push("youtube");
  if (c.tiktok) plats.push("tiktok");
  if (c.facebook) plats.push("facebook");
  if (c.snapchat) plats.push("snapchat");
  if (c.twitter) plats.push("twitter");
  return plats;
}

// ─── Creator Card ─────────────────────────────────────────────────────────────

function CreatorCard({
  creator,
  isSaved,
  onToggleSave,
  onClick,
  onAddToList,
}: {
  creator: typeof creatorsWithCategories[0];
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
  onClick: () => void;
  onAddToList: (e: React.MouseEvent) => void;
}) {
  return (
    <Card
      onClick={onClick}
      className="relative overflow-hidden cursor-pointer rounded-3xl border border-slate-100 bg-white shadow-[0_18px_50px_rgba(31,41,55,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_22px_60px_rgba(99,102,241,0.12)]"
      data-testid={`card-creator-${creator.username}`}
    >
      <button
        onClick={onToggleSave}
        className="absolute top-5 right-5 p-2.5 rounded-full bg-slate-50/90 hover:bg-white text-slate-500 hover:text-violet-600 shadow-sm transition-colors z-[20]"
      >
        <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
      </button>
      <button
        onClick={onAddToList}
        className="absolute top-5 right-16 p-2.5 rounded-full bg-slate-50/90 hover:bg-white text-slate-500 hover:text-violet-600 shadow-sm transition-colors z-[20]"
        title="Add to list"
      >
        <ListPlus className="w-4 h-4" />
      </button>
      <div className="flex justify-center pt-10 mb-4 relative z-10">
        <div className="relative">
          <CreatorAvatar
            username={creator.username}
            name={creator.fullname}
            className="w-20 h-20 rounded-full object-cover bg-slate-100 shadow-sm"
            fallbackClassName="w-20 h-20 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 text-lg font-bold shadow-sm"
          />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white ring-2 ring-white">
            <Check className="h-3 w-3" />
          </span>
        </div>
      </div>
      <div className="px-5 pb-5 text-center">
        <h3 className="text-base font-bold text-slate-900 truncate">{creator.fullname}</h3>
        <p className="text-sm text-violet-500">@{creator.username}</p>
        {(creator.city || creator.country) && (
          <p className="text-xs text-slate-500 mt-1 truncate flex items-center justify-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {[creator.city, creator.country].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Stats: Followers | ER only — clean 50/50 split */}
        <div className="flex items-center justify-around mt-4 pt-4 border-t border-slate-100">
          <div className="text-center">
            <div className="text-lg font-black text-slate-900">{fmtNum(creator.followers)}</div>
            <div className="text-xs text-slate-500">Followers</div>
          </div>
          <div className="w-px h-10 bg-slate-100" />
          <div className="text-center">
            <div className="text-lg font-black text-emerald-500">
              {creator.er != null ? `${creator.er}%` : "—"}
            </div>
            <div className="text-xs text-slate-500">Eng. Rate</div>
          </div>
        </div>

        {/* Single-line: 1 category + 1 interest max, no wrap */}
        <div className="flex gap-2 mt-4 justify-center overflow-hidden">
          {creator.categories[0] && (
            <span className="text-xs px-3 py-1 rounded-full bg-violet-50 text-violet-600 font-medium whitespace-nowrap shrink-0">
              {creator.categories[0]}
            </span>
          )}
          {creator.topInterests[0] && (
            <span className="text-xs px-3 py-1 rounded-full bg-slate-50 text-slate-500 whitespace-nowrap truncate min-w-0">
              {shortInt(creator.topInterests[0].name)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Creator profile helpers ─────────────────────────────────────────────────

function InsightBar({
  label,
  pct,
  maxPct = 100,
  color = "#8b5cf6",
  labelClassName = "w-24",
  showTrack = true,
  prefix,
}: {
  label: string;
  pct: number;
  maxPct?: number;
  color?: string;
  labelClassName?: string;
  showTrack?: boolean;
  prefix?: React.ReactNode;
}) {
  const width = `${Math.min((pct / maxPct) * 100, 100)}%`;
  return (
    <div className="flex items-center gap-3">
      <div className={`flex shrink-0 items-center gap-2 text-xs font-medium text-[#202946] ${labelClassName}`}>
        {prefix}
        <span className="truncate">{label}</span>
      </div>
      <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${showTrack ? "bg-[#f4f5fb]" : ""}`}>
        <div className="h-full rounded-full" style={{ width, backgroundColor: color }} />
      </div>
      <span className="w-10 shrink-0 text-right text-xs font-medium text-[#111936]">{pct}%</span>
    </div>
  );
}

function ProfileStatCard({
  label,
  value,
  icon,
  tint,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tint: string;
  iconColor: string;
}) {
  return (
    <div className="flex min-h-[90px] flex-col items-center justify-center rounded-xl border border-[#eceefa] bg-white px-3 py-3 text-center shadow-sm">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: tint, color: iconColor }}>
        {icon}
      </div>
      <div className="text-lg font-black tracking-tight text-[#101831]">{value}</div>
      <div className="mt-1 text-xs font-medium text-[#65708c]">{label}</div>
    </div>
  );
}

function InsightSection({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#eceefa] bg-white p-5 shadow-sm ${className}`}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#111936]">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function countryFlag(name: string) {
  return LOCATIONS.find((location) => location.label.toLowerCase() === name.toLowerCase())?.flag;
}

function InterestIcon({ name }: { name: string }) {
  const label = shortInt(name);
  if (label === "Fashion") return <Venus className="h-4 w-4" />;
  if (label === "Cars") return <Car className="h-4 w-4" />;
  if (label === "Photography") return <Camera className="h-4 w-4" />;
  if (label === "Travel") return <Plane className="h-4 w-4" />;
  if (label === "Food & Dining") return <Utensils className="h-4 w-4" />;
  if (label === "Family") return <Users className="h-4 w-4" />;
  if (label === "Beverages") return <Coffee className="h-4 w-4" />;
  if (label === "Fitness") return <Dumbbell className="h-4 w-4" />;
  return <Star className="h-4 w-4" />;
}

// ─── Creator Profile Modal ────────────────────────────────────────────────────

function CreatorProfileModal({ creator, onClose }: { creator: Creator; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  const credColor = creator.followerCredibility == null ? "text-muted-foreground" : creator.followerCredibility >= 70 ? "text-emerald-400" : creator.followerCredibility >= 50 ? "text-amber-400" : "text-red-400";
  const credBar = creator.followerCredibility == null ? "bg-muted" : creator.followerCredibility >= 70 ? "bg-emerald-500" : creator.followerCredibility >= 50 ? "bg-amber-500" : "bg-red-500";
  const maxCity = Math.max(...creator.topCities.map((c) => c.pct), 1);
  const maxCountry = Math.max(...creator.topCountries.map((c) => c.pct), 1);
  const plats = creatorPlatforms(creator);
  const femalePct = creator.femalePct ?? (creator.malePct != null ? Math.max(0, 100 - creator.malePct) : 0);
  const malePct = creator.malePct ?? Math.max(0, 100 - femalePct);
  const genderTotal = Math.max(femalePct + malePct, 1);
  const femaleSlice = (femalePct / genderTotal) * 100;

  const platformLinks: Record<string, string> = {
    instagram: creator.instagram, youtube: creator.youtube, tiktok: creator.tiktok,
    facebook: creator.facebook, snapchat: creator.snapchat, twitter: creator.twitter,
  };
  const platformColors: Record<string, string> = {
    instagram: "from-[#e41469] to-[#ff6a4f] text-white shadow-sm",
    youtube: "from-[#ff2f2f] to-[#ff6969] text-white shadow-sm",
    tiktok: "from-[#111936] to-[#303953] text-white shadow-sm",
    facebook: "from-[#2b70f6] to-[#5791ff] text-white shadow-sm",
    snapchat: "from-[#ffd43b] to-[#f4c10f] text-white shadow-sm",
    twitter: "from-[#111936] to-[#303953] text-white shadow-sm",
  };
  const platformLabel: Record<string, string> = {
    instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok",
    facebook: "Facebook", snapchat: "Snapchat", twitter: "X",
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#eef4ff]/88 px-3 py-4 backdrop-blur-sm sm:px-6 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/80 bg-white px-6 py-6 shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar transform scale-90 sm:scale-[0.85] origin-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[#111936] shadow-sm transition-colors hover:bg-slate-200"
          aria-label="Close creator insights"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex flex-col gap-5 pr-8 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <CreatorAvatar
              username={creator.username}
              name={creator.fullname}
              className="h-24 w-24 rounded-2xl bg-[#eef0f7] object-cover shadow-sm"
              fallbackClassName="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#eef0f7] text-2xl font-bold text-[#65708c] shadow-sm"
            />
            <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#7c5cff] text-white shadow-sm ring-2 ring-white">
              <Check className="h-4 w-4" />
            </span>
          </div>
          <div className="pt-1">
            <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#111936]">
              {creator.fullname}
              <span className="text-xl text-[#8b5cf6]">✦</span>
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#65708c]">
              <span>@{creator.username}</span>
              {(creator.city || creator.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[creator.city, creator.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {creator.instagram && (
                <a
                  href={creator.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-[#fff0f6] px-3 py-1.5 text-xs font-semibold text-[#e41469] transition-colors hover:bg-[#ffe4ef]"
                >
                  <FaInstagram className="h-3.5 w-3.5" />
                  Instagram
                </a>
              )}
              {creator.gender && (
                <span className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#202946] shadow-sm ring-1 ring-[#eceefa]">
                  <Venus className="h-3.5 w-3.5 text-[#65708c]" />
                  {creator.gender === "FEMALE" ? "Female" : creator.gender === "MALE" ? "Male" : creator.gender}
                </span>
              )}
            </div>
            {creator.snapchat && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#202946]">
                <FaSnapchatGhost className="h-3.5 w-3.5 text-[#f4c10f]" />
                Snapchat: <span>{creator.username}</span>
                <span className="text-[#f4c10f]">♟</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <ProfileStatCard label="Followers" value={fmtNum(creator.followers)} icon={<Users className="h-4 w-4" />} tint="#f4efff" iconColor="#8b5cf6" />
          <ProfileStatCard label="Eng. Rate" value={creator.er != null ? `${creator.er}%` : "—"} icon={<TrendingUp className="h-4 w-4" />} tint="#fff0f7" iconColor="#ec4899" />
          <ProfileStatCard label="Avg Likes" value={fmtNum(creator.avgLikes)} icon={<Heart className="h-4 w-4 fill-current" />} tint="#fff0f1" iconColor="#f87171" />
          <ProfileStatCard label="Avg Comments" value={fmtNum(creator.avgComments)} icon={<MessageCircle className="h-4 w-4" />} tint="#effdf8" iconColor="#14b8a6" />
          <ProfileStatCard label="Avg Reels Views" value={fmtNum(creator.avgReelsPlays)} icon={<Clapperboard className="h-4 w-4" />} tint="#f5efff" iconColor="#a855f7" />
          <ProfileStatCard label="Total Posts" value={fmtNum(creator.totalPosts)} icon={<FileText className="h-4 w-4" />} tint="#f1efff" iconColor="#6366f1" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {(creator.age1317 || creator.age1824 || creator.age2534 || creator.age3544) && (
            <InsightSection title="Age Distribution" icon={<Users className="h-4 w-4 text-[#8b5cf6]" />}>
              <div className="space-y-4">
                {[{ label: "13–17", value: creator.age1317 }, { label: "18–24", value: creator.age1824 }, { label: "25–34", value: creator.age2534 }, { label: "35–44", value: creator.age3544 }]
                  .filter((a) => a.value != null)
                  .map((a) => <InsightBar key={a.label} label={a.label} pct={a.value!} color="#9b5cf6" />)}
              </div>
            </InsightSection>
          )}

          {(creator.malePct != null || creator.femalePct != null) && (
            <InsightSection title="Gender Split" icon={<Heart className="h-4 w-4 text-[#ff7a7a]" />}>
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                <div
                  className="relative h-28 w-28 rounded-full"
                  style={{ background: `conic-gradient(#f25bb3 0 ${femaleSlice}%, #6568f6 ${femaleSlice}% 100%)` }}
                >
                  <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white">
                    <Users className="h-6 w-6 text-[#b7bfd4]" />
                  </div>
                </div>
                <div className="min-w-[140px] space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-xs font-medium text-[#65708c]"><span className="h-3 w-3 rounded-full bg-[#f25bb3]" /> Female</span>
                    <span className="text-sm font-bold text-[#111936]">{femalePct}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-xs font-medium text-[#65708c]"><span className="h-3 w-3 rounded-full bg-[#6568f6]" /> Male</span>
                    <span className="text-sm font-bold text-[#111936]">{malePct}%</span>
                  </div>
                </div>
              </div>
            </InsightSection>
          )}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {creator.topCountries.length > 0 && (
            <InsightSection title="Top Countries" icon={<Globe2 className="h-4 w-4 text-[#6763f8]" />}>
              <div className="space-y-3">
                {creator.topCountries.slice(0, 5).map((country, i) => (
                  <InsightBar
                    key={`${country.name}-${i}`}
                    label={country.name}
                    pct={country.pct}
                    maxPct={maxCountry}
                    color="#8b5cf6"
                    labelClassName="w-32"
                    prefix={<span className="text-sm leading-none">{countryFlag(country.name) || "•"}</span>}
                  />
                ))}
              </div>
            </InsightSection>
          )}
          {creator.topCities.length > 0 && (
            <InsightSection title="Top Cities" icon={<Building2 className="h-4 w-4 text-[#22b8cf]" />}>
              <div className="space-y-3">
                {creator.topCities.slice(0, 5).map((city, i) => (
                  <InsightBar
                    key={`${city.name}-${i}`}
                    label={city.name}
                    pct={city.pct}
                    maxPct={maxCity}
                    color="#32b8cf"
                    labelClassName="w-32"
                  />
                ))}
              </div>
            </InsightSection>
          )}
        </div>

        {creator.topInterests.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold text-[#111936]">
              <Star className="h-4 w-4 text-[#ff3d87]" />
              Top Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {creator.topInterests.slice(0, 8).map((interest, i) => (
                <span
                  key={`${interest.name}-${i}`}
                  className="flex items-center gap-2 rounded-full border border-[#ffd8ef] bg-white px-3 py-1.5 text-xs font-medium text-[#202946]"
                >
                  <span className="text-[#d65af6]"><InterestIcon name={interest.name} /></span>
                  {shortInt(interest.name)}
                  <span className="text-[#8b5cf6]">{interest.pct}%</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {(creator.followerCredibility != null || creator.notableFollowers != null) && (
          <div className="mt-6 px-1">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#111936]">
              <Shield className="h-4 w-4 text-[#65708c]" />
              Audience Quality
            </h3>
            <div className="space-y-4">
              {creator.followerCredibility != null && (
                <div className="flex items-center gap-4">
                  <span className="w-36 shrink-0 text-xs font-medium text-[#65708c]">Follower Credibility</span>
                  <div className="h-1.5 flex-1 rounded-full bg-[#f4f5fb]">
                    <div className={`h-full rounded-full ${credBar}`} style={{ width: `${creator.followerCredibility}%` }} />
                  </div>
                  <span className={`w-12 text-right text-xs font-bold ${credColor}`}>{creator.followerCredibility}%</span>
                </div>
              )}
              {creator.notableFollowers != null && (
                <div className="flex items-center gap-4">
                  <span className="w-36 shrink-0 text-xs font-medium text-[#65708c]">Notable Followers</span>
                  <div className="h-1.5 flex-1 rounded-full bg-[#f4f5fb]">
                    <div className="h-full rounded-full bg-[#facc15]" style={{ width: `${creator.notableFollowers}%` }} />
                  </div>
                  <span className="w-12 text-right text-xs font-bold text-[#111936]">{creator.notableFollowers}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 px-1">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#111936]">
            <Phone className="h-4 w-4 text-[#65708c]" />
            Platforms & Contact
          </h3>
          <div className="flex flex-wrap gap-3">
            {plats.map((platform) => (
              <a
                key={platform}
                href={platformLinks[platform]}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${platformColors[platform]}`}
              >
                <PlatformIcon platform={platform} size="sm" />
                {platformLabel[platform]}
              </a>
            ))}
            {creator.linktree && (
              <a
                href={creator.linktree}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#34d399] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <ExternalLink className="h-4 w-4" />
                Linktree
              </a>
            )}
            {creator.email && (
              <a
                href={`mailto:${creator.email}`}
                className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#202946] shadow-sm ring-1 ring-[#eceefa] transition-transform hover:-translate-y-0.5"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            )}
          </div>
        </div>

        {creator.bio && (
          <p className="mt-6 px-1 text-xs leading-relaxed text-[#65708c]">{creator.bio}</p>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar Checkbox group ───────────────────────────────────────────────────

function FilterGroup({ title, items, selected, onChange }: {
  title: string;
  items: { label: string; value: string; icon?: React.ReactNode; count?: number }[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-2.5">
        {items.map((item) => (
          <label key={item.value} className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={selected.includes(item.value)}
              className="rounded-full border-slate-300 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
              onCheckedChange={() => toggle(item.value)}
              data-testid={`checkbox-${title.toLowerCase().replace(/\s+/g, "-")}-${item.value}`}
            />
            {item.icon && <span>{item.icon}</span>}
            <span className="text-sm text-slate-600 group-hover:text-slate-900 flex-1 truncate">{item.label}</span>
            {item.count != null && <span className="text-xs text-slate-400">({item.count})</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────

type SortField = "followers" | "er";
type SortDir = "desc" | "asc";

function SortControls({ field, dir, onFieldChange, onDirToggle }: {
  field: SortField; dir: SortDir; onFieldChange: (f: SortField) => void; onDirToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="flex items-center gap-1" ref={ref}>
      <div className="relative">
        <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)} className="gap-1.5 h-11 rounded-full border-slate-200 bg-white px-4 text-slate-700 shadow-sm hover:bg-white">
          {field === "followers" ? "Total Followers" : "Engagement Rate"}
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
        {open && (
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-100 rounded-2xl shadow-lg py-1 min-w-[170px]">
            {(["followers", "er"] as SortField[]).map((f) => (
              <button key={f} onClick={() => { onFieldChange(f); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${field === f ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                {f === "followers" ? "Total Followers" : "Engagement Rate"}
              </button>
            ))}
          </div>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={onDirToggle} className="h-11 w-11 rounded-full border-slate-200 bg-white p-0 text-slate-700 shadow-sm hover:bg-white" title={dir === "desc" ? "Descending" : "Ascending"}>
        {dir === "desc" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
      </Button>
    </div>
  );
}

// ─── Main Discover Page ───────────────────────────────────────────────────────

export default function DiscoverPage() {
  const { user } = useAuth();
  const prefetched = usePrefetchedData();
  const [activeTab, setActiveTab] = useState("creators");

  // Safely read query param after hydration to prevent mismatch error
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "lists") {
        setActiveTab("lists");
      }
    }
  }, []);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [followerMin, setFollowerMin] = useState<number[]>([0]);
  const [sortField, setSortField] = useState<SortField>("followers");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Creator | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    setShowSavedOnly(activeTab === "saved");
  }, [activeTab]);

  // New filters
  const [erMin, setErMin] = useState<number[]>([0]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [credibilityMin, setCredibilityMin] = useState<number[]>([0]);
  const [gender, setGender] = useState("All");
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [language, setLanguage] = useState("Any");
  const [ageFrom, setAgeFrom] = useState("Any");
  const [ageTo, setAgeTo] = useState("Any");

  // ── Add to List modal state ──
  const [listModalCreator, setListModalCreator] = useState<string | null>(null);
  const [userLists, setUserLists] = useState<CreatorList[]>(() => prefetched.lists);
  const [isAddingToList, setIsAddingToList] = useState<string | null>(null);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [newListNameInline, setNewListNameInline] = useState("");

  const refreshUserLists = useCallback(async () => {
    const effectiveUserId = user?.id || "local-test-user-id";
    setIsLoadingLists(true);
    try {
      const lists = await fetchLists(effectiveUserId);
      setUserLists(lists);
    } catch (e) {
      console.error("Failed to fetch lists", e);
    } finally {
      setIsLoadingLists(false);
    }
  }, [user?.id]);

  // Sync lists from prefetch provider when it updates
  useEffect(() => {
    setUserLists(prefetched.lists);
  }, [prefetched.lists]);

  useEffect(() => {
    // Only fetch if we don't have pre-fetched data
    if (userLists.length === 0) {
      refreshUserLists();
    }
    const handleUpdate = () => refreshUserLists();
    window.addEventListener("vairal-lists-updated", handleUpdate);
    return () => window.removeEventListener("vairal-lists-updated", handleUpdate);
  }, [refreshUserLists]);

  const openListModal = (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setListModalCreator(username);
    setNewListNameInline("");
    refreshUserLists(); // refresh just in case
  };

  const handleAddToListAndClose = async (listId: string) => {
    if (!listModalCreator) return;
    setIsAddingToList(listId);
    const success = await addCreatorToList(listId, listModalCreator);
    setIsAddingToList(null);
    // Close modal first so toast renders in a clean layer
    setListModalCreator(null);
    if (success) {
      toast({
        title: "Added to list",
        description: `Creator added successfully.`,
      });
    } else {
      toast({
        title: "Already in list",
        description: "This creator is already in that list.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAndAdd = async () => {
    const effectiveUserId = user?.id || "local-test-user-id";
    if (!newListNameInline.trim() || !listModalCreator) return;
    const listName = newListNameInline.trim();
    const creatorUsername = listModalCreator;
    setIsAddingToList('new');
    const list = await createList(effectiveUserId, listName);
    if (list) {
      await addCreatorToList(list.id, creatorUsername);
      setIsAddingToList(null);
      setNewListNameInline("");
      // Close modal first so toast renders cleanly
      setListModalCreator(null);
      toast({
        title: "List created",
        description: `"${listName}" created and creator added.`,
      });
    } else {
      setIsAddingToList(null);
      setNewListNameInline("");
      setListModalCreator(null);
      toast({
        title: "Failed to create list",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const [savedUsernames, setSavedUsernames] = useState<Set<string>>(
    () => new Set(prefetched.savedCreators)
  );

  const refreshSavedCreators = useCallback(async () => {
    if (!user?.id) return;
    try {
      const names = await fetchSavedCreators(user.id);
      setSavedUsernames(new Set(names));
    } catch (e) {
      console.error("refreshSavedCreators failed", e);
    }
  }, [user?.id]);

  // Sync saved creators from prefetch provider
  useEffect(() => {
    setSavedUsernames(new Set(prefetched.savedCreators));
  }, [prefetched.savedCreators]);

  useEffect(() => {
    // Only fetch if we don't have any pre-fetched data
    if (savedUsernames.size === 0) {
      refreshSavedCreators();
    }

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.type) {
        setSavedUsernames(prev => {
          const next = new Set(prev);
          if (detail.type === "save") next.add(detail.username);
          if (detail.type === "unsave") next.delete(detail.username);
          return next;
        });
      } else {
        refreshSavedCreators();
      }
    };

    window.addEventListener("vairal-creators-updated", handleUpdate);
    window.addEventListener("vairal-auth-refreshed", refreshSavedCreators);
    return () => {
      window.removeEventListener("vairal-creators-updated", handleUpdate);
      window.removeEventListener("vairal-auth-refreshed", refreshSavedCreators);
    };
  }, [refreshSavedCreators]);

  const toggleSave = async (creator: typeof creatorsWithCategories[0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user?.id) return;

    const username = creator.username;
    const isSaved = savedUsernames.has(username);

    // 1. Optimistic UI update
    setSavedUsernames((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(username);
      else next.add(username);
      return next;
    });

    // 2. Backend sync
    let success = false;
    if (isSaved) {
      success = await unsaveCreator(user.id, username);
    } else {
      success = await saveCreator(user.id, {
        username,
        fullname: creator.fullname,
        platform: creator.instagram ? "Instagram" : creator.youtube ? "YouTube" : creator.tiktok ? "TikTok" : "Other",
        followers: creator.followers || 0,
        er: creator.er || 0,
        categories: creator.categories || [],
      });
    }

    // 3. Rollback on failure
    if (!success) {
      setSavedUsernames((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(username); // Re-add if we failed to delete
        else next.delete(username); // Remove if we failed to add
        return next;
      });
    }
  };

  // Progressive rendering: start with the full Discovery dataset, then keep the
  // observer path available if the dataset grows beyond the current 100.
  const BATCH = 20;
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Count creators per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    creatorsWithCategories.forEach((c) => c.categories.forEach((cat) => { counts[cat] = (counts[cat] || 0) + 1; }));
    return counts;
  }, []);

  // Platform counts
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { instagram: 0, youtube: 0, tiktok: 0, facebook: 0, snapchat: 0, twitter: 0 };
    creatorsWithCategories.forEach((c) => {
      if (c.instagram) counts.instagram++;
      if (c.youtube) counts.youtube++;
      if (c.tiktok) counts.tiktok++;
      if (c.facebook) counts.facebook++;
      if (c.snapchat) counts.snapchat++;
      if (c.twitter) counts.twitter++;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let result = creatorsWithCategories;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.fullname.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.categories.some((cat) => cat.toLowerCase().includes(q))
      );
    }

    if (showSavedOnly) {
      result = result.filter((c) => savedUsernames.has(c.username));
    }

    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.some((sc) => c.categories.includes(sc)));
    }

    if (selectedPlatforms.length > 0) {
      result = result.filter((c) => selectedPlatforms.some((p) => {
        if (p === "instagram") return !!c.instagram;
        if (p === "youtube") return !!c.youtube;
        if (p === "tiktok") return !!c.tiktok;
        if (p === "facebook") return !!c.facebook;
        if (p === "snapchat") return !!c.snapchat;
        if (p === "twitter") return !!c.twitter;
        return false;
      }));
    }

    // Followers Min (Slider)
    if (followerMin[0] > 0) {
      result = result.filter((c) => (c.followers ?? 0) >= followerMin[0]);
    }

    // ER Min (Slider)
    if (erMin[0] > 0) {
      result = result.filter((c) => (c.er ?? 0) >= erMin[0]);
    }

    // Credibility Min (Slider)
    if (credibilityMin[0] > 0) {
      // Assuming credibility is in c.quality_score or we mock it if missing
      result = result.filter((c) => {
         const cred = (c as any).follower_credibility ?? (c.er ? c.er * 10 : 50);
         return cred >= credibilityMin[0];
      });
    }

    if (selectedLocations.length > 0) {
      result = result.filter((c) => {
        const haystack = `${c.country ?? ""} ${c.city ?? ""}`.toLowerCase();
        return selectedLocations.some((loc) => {
          const locObj = LOCATIONS.find((l) => l.label === loc);
          return locObj ? locObj.keywords.some((kw) => haystack.includes(kw)) : haystack.includes(loc.toLowerCase());
        });
      });
    }

    if (gender !== "All") {
      result = result.filter((c) => {
         // Assuming c.gender might be string
         if (!c.gender) return false;
         return c.gender.toLowerCase() === gender.toLowerCase();
      });
    }

    // Age
    if (selectedAges.length > 0) {
      result = result.filter((c) => {
        const cAge = (c as any).creator_age_bracket;
        if (!cAge) return false;
        return selectedAges.includes(cAge);
      });
    }

    // Language
    if (selectedLanguages.length > 0) {
      result = result.filter((c) => {
         const langs = (c as any).languages || [];
         return selectedLanguages.some(sl => langs.includes(sl));
      });
    }

    // Interests
    if (selectedInterests.length > 0) {
      result = result.filter((c) => {
         const ints = (c as any).top_interests || [];
         return selectedInterests.some(si => ints.some((ti: any) => ti.interest === si));
      });
    }

    result.sort((a, b) => {
      const va = sortField === "followers" ? (a.followers ?? 0) : (a.er ?? 0);
      const vb = sortField === "followers" ? (b.followers ?? 0) : (b.er ?? 0);
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return result;
  }, [search, selectedCategories, selectedPlatforms, followerMin, erMin, credibilityMin, selectedLocations, gender, selectedAges, selectedLanguages, selectedInterests, sortField, sortDir, showSavedOnly, savedUsernames]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(BATCH);
  }, [search, selectedCategories, selectedPlatforms, followerMin, erMin, credibilityMin, selectedLocations, gender, selectedAges, selectedLanguages, selectedInterests, sortField, sortDir, showSavedOnly]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH, filtered.length));
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtered.length]);

  const visibleCreators = filtered.slice(0, visibleCount);

  const categoryItems = PLATFORM_CATEGORIES.map((cat) => ({
    label: cat, value: cat, count: categoryCounts[cat] || 0,
  }));

  const platformItems = [
    { label: "Instagram", value: "instagram", count: platformCounts.instagram, icon: <FaInstagram className="w-4 h-4 text-current" /> },
    { label: "YouTube", value: "youtube", count: platformCounts.youtube, icon: <FaYoutube className="w-4 h-4 text-current" /> },
    { label: "TikTok", value: "tiktok", count: platformCounts.tiktok, icon: <FaTiktok className="w-4 h-4 text-current" /> },
    { label: "Facebook", value: "facebook", count: platformCounts.facebook, icon: <FaFacebook className="w-4 h-4 text-current" /> },
    { label: "Snapchat", value: "snapchat", count: platformCounts.snapchat, icon: <FaSnapchatGhost className="w-4 h-4 text-current" /> },
    {
      label: "X", value: "twitter", count: platformCounts.twitter, icon: (
        <svg className="w-4 h-4 text-current" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      )
    },
  ];

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedPlatforms.length > 0 ||
    followerMin[0] > 0 ||
    erMin[0] > 0 ||
    credibilityMin[0] > 0 ||
    selectedLocations.length > 0 ||
    gender !== "All" ||
    selectedAges.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedInterests.length > 0 ||
    showSavedOnly ||
    !!search.trim();

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPlatforms([]);
    setFollowerMin([0]);
    setErMin([0]);
    setCredibilityMin([0]);
    setSelectedLocations([]);
    setLocationSearch("");
    setGender("All");
    setSelectedAges([]);
    setSelectedLanguages([]);
    setSelectedInterests([]);
    setShowSavedOnly(false);
    setSearch("");
  };

  const discoverContent = (
    <div className="flex flex-col lg:flex-row gap-7">
          {/* Main content moved to left */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-7">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input placeholder="Search by name, handle, location, or interest…" className="h-14 rounded-full border-slate-200 bg-white pl-14 text-slate-600 shadow-sm" value={search}
                onChange={(e) => setSearch(e.target.value)} data-testid="input-search-creators" />
            </div>

            {/* Count + Sort */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <p className="text-base text-slate-500" data-testid="text-creator-count">
                {filtered.length} creator{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 hidden sm:inline">Sort by</span>
                <SortControls field={sortField} dir={sortDir}
                  onFieldChange={setSortField}
                  onDirToggle={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))} />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {visibleCreators.map((creator) => (
                <CreatorCard
                  key={creator.username}
                  creator={creator}
                  isSaved={savedUsernames.has(creator.username)}
                  onToggleSave={(e) => toggleSave(creator, e)}
                  onClick={() => setSelected(creator)}
                  onAddToList={(e) => openListModal(creator.username, e)}
                />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No creators match your filters. <button className="text-violet-500 hover:underline ml-1" onClick={clearFilters}>Clear all</button>
              </div>
            )}
          </div>

          {/* Filter Sidebar moved to right */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-6 h-[calc(100vh-3rem)]">
              <div className="h-full overflow-y-auto scroll-smooth pb-8" style={{ scrollbarWidth: "none" }}>
                <div className="pr-1">
                  <Card className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(31,41,55,0.06)]" data-testid="card-filters">

                    {/* Filters Header */}
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="font-serif text-2xl text-slate-900">Filters</h2>
                      <SlidersHorizontal className="w-5 h-5 text-slate-500" />
                    </div>

                    {/* ── Social Platforms ── */}
                    <div className="mb-8">
                      <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-slate-500 mb-4">Platform</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedPlatforms([])}
                          className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center ${selectedPlatforms.length === 0 ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          All
                        </button>
                        {platformItems.map(item => (
                          <button
                            key={item.value}
                            onClick={() => {
                              setSelectedPlatforms(prev => 
                                prev.includes(item.value) ? prev.filter(p => p !== item.value) : [...prev, item.value]
                              )
                            }}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${selectedPlatforms.includes(item.value) ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            title={item.label}
                          >
                            {item.icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Categories ── */}
                    <div className="mb-8">
                      <h3 className="text-[11px] uppercase tracking-[0.15em] font-bold text-slate-500 mb-4">Category</h3>
                      <div className="flex flex-wrap gap-2">
                        {categoryItems.map(item => (
                          <button
                            key={item.value}
                            onClick={() => {
                              setSelectedCategories(prev => 
                                prev.includes(item.value) ? prev.filter(c => c !== item.value) : [...prev, item.value]
                              )
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategories.includes(item.value) ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Followers Range ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Follower count</h3>
                      <Slider
                        min={0}
                        max={10000000}
                        step={50000}
                        value={followerMin}
                        onValueChange={setFollowerMin}
                        className="my-4"
                      />
                      <div className="text-sm text-slate-500 font-medium">{followerMin[0] >= 10000000 ? "10M+" : (followerMin[0] >= 1000000 ? (followerMin[0]/1000000).toFixed(1) + "M+" : (followerMin[0]/1000).toFixed(0) + "K+")}</div>
                    </div>

                    {/* ── Engagement Rate ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Engagement rate</h3>
                      <Slider
                        min={0}
                        max={20}
                        step={0.5}
                        value={erMin}
                        onValueChange={setErMin}
                        className="my-4"
                      />
                      <div className="text-sm text-slate-500 font-medium">{erMin[0]}%+</div>
                    </div>

                    {/* ── Creator Age ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Creator age</h3>
                      <div className="flex flex-wrap gap-2">
                        {["18-24", "25-34", "35-44", "45+"].map(age => (
                          <button
                            key={age}
                            onClick={() => setSelectedAges(prev => prev.includes(age) ? prev.filter(x => x !== age) : [...prev, age])}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedAges.includes(age) ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Language ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Language</h3>
                      <div className="flex flex-wrap gap-2">
                        {["English", "Arabic", "Korean", "Spanish", "French", "Hindi"].map(lang => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguages(prev => prev.includes(lang) ? prev.filter(x => x !== lang) : [...prev, lang])}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedLanguages.includes(lang) ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Top Interests ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Top interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Automotive", "Beauty", "Business", "Cooking", "Design", "Esports", "Family", "Fashion", "Finance", "Fitness", "Food", "Gaming", "Health", "Home", "Hospitality", "K-Culture", "Lifestyle", "Parenting", "Photography", "Tech", "Travel", "Wellness"].map(interest => (
                          <button
                            key={interest}
                            onClick={() => setSelectedInterests(prev => prev.includes(interest) ? prev.filter(x => x !== interest) : [...prev, interest])}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedInterests.includes(interest) ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Audience Credibility ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Audience credibility</h3>
                      <Slider
                        min={0}
                        max={95}
                        step={5}
                        value={credibilityMin}
                        onValueChange={setCredibilityMin}
                        className="my-4"
                      />
                      <div className="text-sm text-slate-500 font-medium">{credibilityMin[0]}%+</div>
                    </div>

                    {/* ── Location ── */}
                    <div className="mb-5 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Location</h3>
                      <div className="relative mb-2">
                        <Input
                          placeholder="Search country…"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          className="text-sm h-10 rounded-full border-slate-200 pl-4"
                        />
                      </div>
                      <div className="space-y-3 max-h-56 overflow-y-auto scroll-smooth pt-2" style={{ scrollbarWidth: "thin" }}>
                        {LOCATIONS.filter((l) => l.label.toLowerCase().includes(locationSearch.toLowerCase())).map((loc) => (
                          <label key={loc.label} className="flex items-center gap-2 cursor-pointer group">
                            <Checkbox
                              checked={selectedLocations.includes(loc.label)}
                              className="rounded-full border-slate-300 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                              onCheckedChange={() =>
                                setSelectedLocations((prev) =>
                                  prev.includes(loc.label) ? prev.filter((x) => x !== loc.label) : [...prev, loc.label]
                                )
                              }
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                              {loc.flag} {loc.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 rounded-full border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        onClick={clearFilters}
                      >
                        Reset filters
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
    
    </div>
  );

  return (
    <>
      {selected && <CreatorProfileModal creator={selected} onClose={() => setSelected(null)} />}

      <div className="min-h-full w-full bg-[#f8f8ff] p-6 sm:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8 flex items-center justify-between">
            <TabsList className="h-14 justify-start gap-7 rounded-none bg-transparent p-0 border-0">
              <TabsTrigger value="creators" className="h-14 rounded-none border-b-2 border-transparent bg-transparent px-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:text-violet-600 data-[state=active]:shadow-none">Creators</TabsTrigger>
              <TabsTrigger value="saved" className="h-14 rounded-none border-b-2 border-transparent bg-transparent px-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:text-violet-600 data-[state=active]:shadow-none">Saved Creators</TabsTrigger>
              <TabsTrigger value="lists" className="h-14 rounded-none border-b-2 border-transparent bg-transparent px-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:text-violet-600 data-[state=active]:shadow-none">Talent Lists</TabsTrigger>
            </TabsList>

          </div>
          
          <TabsContent value="creators" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            {discoverContent}
          </TabsContent>
          <TabsContent value="saved" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            {discoverContent}
          </TabsContent>
          <TabsContent value="lists" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="-mx-6 sm:-mx-8">
              <ListsPanel hideHeader={true} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add to List Modal */}
      {listModalCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setListModalCreator(null)}>
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Add to List</h3>
              <button onClick={() => setListModalCreator(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {isLoadingLists ? (
                <div className="p-4 flex justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : userLists.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">No lists yet. Create one below.</p>
              ) : (
                userLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleAddToListAndClose(list.id)}
                    disabled={isAddingToList !== null}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{list.name}</span>
                      {isAddingToList === list.id && <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{list.member_count || 0} creators</span>
                  </button>
                ))
              )}
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                  <Input
                    placeholder="New list name…"
                    value={newListNameInline}
                    onChange={(e) => setNewListNameInline(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isAddingToList && handleCreateAndAdd()}
                    className="text-sm flex-1"
                    disabled={isAddingToList !== null}
                  />
                  <Button size="sm" onClick={handleCreateAndAdd} disabled={!newListNameInline.trim() || isAddingToList !== null}>
                    {isAddingToList === 'new' ? (
                      <div className="w-3.5 h-3.5 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 mr-1" /> 
                    )}
                    Create & Add
                  </Button>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
