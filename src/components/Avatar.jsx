/**
 * Avatar Component
 * Reusable avatar component with referrerPolicy for external images (Google, etc.)
 */
function Avatar({
    src,
    alt = '',
    size = 'md',
    className = '',
    fallbackIcon = 'fi fi-rr-user',
    fallbackBg = 'bg-[#0d59f2]/10',
    fallbackText = null
}) {
    const sizeClasses = {
        xs: 'size-5',
        sm: 'size-6',
        md: 'size-8',
        lg: 'size-10',
        xl: 'size-12',
        '2xl': 'size-16',
        '3xl': 'size-20',
    };

    const iconSizes = {
        xs: 'text-[8px]',
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm',
        xl: 'text-base',
        '2xl': 'text-lg',
        '3xl': 'text-xl',
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const iconSize = iconSizes[size] || iconSizes.md;

    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={`${sizeClass} rounded-full object-cover ${className}`}
                referrerPolicy="no-referrer"
            />
        );
    }

    // Fallback to icon or initial letter
    return (
        <div className={`${sizeClass} rounded-full ${fallbackBg} flex items-center justify-center ${className}`}>
            {fallbackText ? (
                <span className={`font-bold ${iconSize}`}>{fallbackText}</span>
            ) : (
                <i className={`${fallbackIcon} ${iconSize}`}></i>
            )}
        </div>
    );
}

export default Avatar;
