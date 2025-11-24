import React, { useState, useMemo } from 'react';
import * as Icons from 'react-icons/io5';

// Popular Ionicons for categories
const POPULAR_ICONS = [
    'play-circle', 'school', 'megaphone', 'ellipsis-horizontal',
    'trophy', 'star', 'heart', 'flame', 'rocket', 'bulb',
    'musical-notes', 'film', 'game-controller', 'basketball',
    'fitness', 'restaurant', 'car', 'airplane', 'home',
    'business', 'briefcase', 'medical', 'book', 'library',
    'cafe', 'wine', 'beer', 'pizza', 'ice-cream', 'fast-food',
    'shirt', 'diamond', 'gift', 'cart', 'card', 'wallet',
    'paw', 'leaf', 'flower', 'sunny', 'moon', 'rainy',
    'snow', 'thunderstorm', 'cloudy', 'partly-sunny', 'umbrella',
    'bicycle', 'boat', 'train', 'bus', 'walk', 'barbell',
    'football', 'tennisball', 'baseball', 'golf', 'footsteps',
    'basket', 'football-outline', 'basketball-outline', 'tennisball-outline'
];

const IconPicker = ({ selectedIcon, onSelect, label = "Select Icon" }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAll, setShowAll] = useState(false);

    // Get all available icons from react-icons/io5
    const allIcons = useMemo(() => {
        return Object.keys(Icons).filter(key =>
            key.startsWith('Io') &&
            !key.includes('Logo') &&
            !key.includes('Outline') === false
        ).map(key => {
            // Convert IoPlayCircle to play-circle
            const iconName = key
                .replace(/^Io/, '')
                .replace(/([A-Z])/g, '-$1')
                .toLowerCase()
                .substring(1);
            return {
                key,
                name: iconName,
                Component: Icons[key]
            };
        });
    }, []);

    const filteredIcons = useMemo(() => {
        const iconsToShow = showAll ? allIcons : POPULAR_ICONS.map(iconName => {
            // Find the icon component
            const iconKey = 'Io' + iconName.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join('');
            const Component = Icons[iconKey];
            if (Component) {
                return { key: iconKey, name: iconName, Component };
            }
            return null;
        }).filter(Boolean);

        if (!searchTerm) return iconsToShow;

        return iconsToShow.filter(icon =>
            icon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, showAll, allIcons]);

    const getIconComponent = (iconName) => {
        const iconKey = 'Io' + iconName.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
        return Icons[iconKey] || Icons.IoEllipsisHorizontal;
    };

    const SelectedIcon = selectedIcon ? getIconComponent(selectedIcon) : Icons.IoEllipsisHorizontal;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {/* Selected Icon Preview */}
            <div className="mb-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                        <SelectedIcon className="text-2xl text-gray-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {selectedIcon || 'No icon selected'}
                        </p>
                        <p className="text-xs text-gray-500">Current selection</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-3">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search icons..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
            </div>

            {/* Toggle All/Popular */}
            <div className="mb-3 flex justify-end">
                <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    {showAll ? 'Show Popular Only' : 'Show All Icons'}
                </button>
            </div>

            {/* Icon Grid */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white max-h-64 overflow-y-auto">
                <div className="grid grid-cols-6 gap-3">
                    {filteredIcons.map((icon) => {
                        const IconComponent = icon.Component;
                        const isSelected = icon.name === selectedIcon;
                        return (
                            <button
                                key={icon.key}
                                type="button"
                                onClick={() => onSelect(icon.name)}
                                className={`
                                    p-3 rounded-lg border-2 transition-all duration-200
                                    ${isSelected
                                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                                    }
                                `}
                                title={icon.name}
                            >
                                <IconComponent
                                    className={`text-2xl ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`}
                                />
                            </button>
                        );
                    })}
                </div>
                {filteredIcons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No icons found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default IconPicker;


