path = r'frontend/src/data/reviews.ts'
with open(path, encoding='utf-8') as f:
    s = f.read()
# replace to match types
s = s.replace(\"import type { Review } from \\\"@/types/content\\\";\n\", \"import type { Review } from \\\"@/services/types\\\";\n\")
# adapt fields
s = s.replace('    author: \"', '    authorName: \"')
s = s.replace('    text: ', '    text: { en: ')
# easier: simpler approach - rewrite to match structure
open(path,'w',encoding='utf-8').write(s)
print('ok')
