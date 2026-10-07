import sys
path = r'frontend/src/sections/home/TrustStrip.tsx'
s = open(path, encoding='utf-8').read()
s = s.replace(
  '  const items = ([\"rustResistant\", \"tarnishResistant\", \"skinFriendly\", \"waterFriendly\"] as const).map(\n    (key) => {\n      const Icon = icons[key];\n      const label = t(	rust.);\n      const badgeText = localize(storeSettings.trustBadges[key], locale);\n      return {\n        key,\n        label,\n        badgeText,\n        Icon,\n      };\n    },\n  );',
  '''  const items = [
    { key: "rustResistant" as const, Icon: icons.rustResistant },
    { key: "tarnishResistant" as const, Icon: icons.tarnishResistant },
    { key: "skinFriendly" as const, Icon: icons.skinFriendly },
    { key: "waterFriendly" as const, Icon: icons.waterFriendly },
  ].map(({ key, Icon }) => ({
    key,
    label: t(	rust.),
    badgeText: localize(storeSettings.trustBadges[key as keyof typeof storeSettings.trustBadges], locale),
    Icon,
  }));'''
)
open(path, 'w', encoding='utf-8').write(s)
print('ok')
