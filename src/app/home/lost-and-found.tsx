import { Image } from 'expo-image';
import { useState } from 'react';
import {
  MdChatBubbleOutline,
  MdFavorite,
  MdFavoriteBorder,
  MdMoreHoriz,
  MdOutlineLocationOn,
} from 'react-icons/md';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreatePostModal, type NewPostData, type PostKind } from '@/components/create-post-modal';
import { Dropdown } from '@/components/dropdown';
import { Icon } from '@/components/icon';
import { PostActionsSheet, type PostAction } from '@/components/post-actions-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { rescoOptions } from '@/constants/rescos';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const preferredResco = 'Jonathan Edwards';

const ALL_COLLEGES = 'All colleges';
const rescoFilterOptions = [ALL_COLLEGES, ...rescoOptions];

type KindFilter = 'all' | PostKind;

const kindFilters: { id: KindFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'found', label: 'Found items' },
  { id: 'message', label: 'Messages' },
];

type Post = {
  id: string;
  kind: PostKind;
  name: string;
  resco: string;
  timeAgo: string;
  avatar: number;
  image?: number;
  description: string;
  spotDescription?: string;
  isSensitive?: boolean;
  likes: number;
  liked: boolean;
  claimed: boolean;
  commentCount?: number;
};

const initialPosts: Post[] = [
  {
    id: '1',
    kind: 'found',
    name: 'Strawberry',
    resco: 'Jonathan Edwards',
    timeAgo: '3 min ago',
    avatar: require('@/assets/images/illustrations/avatar-strawberry.png'),
    image: require('@/assets/images/illustrations/post-sock.png'),
    description: 'Sock found under JE laundry sink!!',
    spotDescription: 'Under the sink',
    likes: 21,
    liked: false,
    claimed: false,
  },
  {
    id: '2',
    kind: 'message',
    name: 'Daniel',
    resco: 'Saybrook',
    timeAgo: '2 hrs ago',
    avatar: require('@/assets/images/illustrations/avatar-daniel.png'),
    description:
      "Hello! If anyone can keep an eye out for a pink fuzzy sock with strawberries on it, please do so :')",
    likes: 6,
    liked: false,
    claimed: false,
    commentCount: 2,
  },
  {
    id: '3',
    kind: 'found',
    name: 'Oscar',
    resco: 'Benjamin Franklin',
    timeAgo: '1 day ago',
    avatar: require('@/assets/images/illustrations/avatar-oscar.png'),
    image: require('@/assets/images/illustrations/post-generic.png'),
    description: 'Left a pile of clothes on the folding table — grab them if they’re yours.',
    spotDescription: 'Folding table by the door',
    isSensitive: true,
    likes: 58,
    liked: false,
    claimed: false,
    commentCount: 5,
  },
];

export default function LostAndFoundScreen() {
  const theme = useTheme();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [createVisible, setCreateVisible] = useState(false);
  const [actionsPostId, setActionsPostId] = useState<string | null>(null);
  const [rescoFilter, setRescoFilter] = useState<string>(ALL_COLLEGES);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [hideDelicates, setHideDelicates] = useState(false);

  const visiblePosts = posts.filter((post) => {
    if (rescoFilter !== ALL_COLLEGES && post.resco !== rescoFilter) return false;
    if (kindFilter !== 'all' && post.kind !== kindFilter) return false;
    if (hideDelicates && post.isSensitive) return false;
    return true;
  });

  const actionsPost = posts.find((post) => post.id === actionsPostId) ?? null;

  function toggleLike(id: string) {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
          : post,
      ),
    );
  }

  function claimPost(post: Post) {
    if (post.claimed) return;
    setPosts((current) => current.map((p) => (p.id === post.id ? { ...p, claimed: true } : p)));
    Alert.alert('Claimed!', `Reach out to ${post.name} to arrange pickup.`);
  }

  function toggleReveal(id: string) {
    setRevealedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePostAction(action: PostAction) {
    const id = actionsPostId;
    if (!id) return;

    if (action === 'flag-sensitive') {
      setPosts((current) =>
        current.map((post) => (post.id === id ? { ...post, isSensitive: !post.isSensitive } : post)),
      );
    } else if (action === 'hide') {
      setPosts((current) => current.filter((post) => post.id !== id));
    } else {
      Alert.alert('Report sent', 'Thanks — a laundry manager will take a look at this post.');
    }
  }

  function handleCreatePost(data: NewPostData) {
    const newPost: Post = {
      id: `local-${Date.now()}`,
      kind: data.kind,
      name: 'You',
      resco: data.resco,
      timeAgo: 'Just now',
      avatar: require('@/assets/images/illustrations/avatar-blueberry.png'),
      image: data.hasPhoto ? require('@/assets/images/illustrations/post-generic.png') : undefined,
      description: data.description,
      spotDescription: data.spotDescription || undefined,
      isSensitive: data.isSensitive,
      likes: 0,
      liked: false,
      claimed: false,
      commentCount: data.kind === 'message' ? 0 : undefined,
    };
    setPosts((current) => [newPost, ...current]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <ThemedText style={styles.headerTitle}>Lost & Found</ThemedText>
          <Pressable
            onPress={() => setCreateVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Create a new post"
            style={[styles.newPostButton, { backgroundColor: theme.text }]}>
            <ThemedText style={[styles.newPostButtonLabel, { color: theme.background }]}>
              +
            </ThemedText>
          </Pressable>
        </View>
        <FlatList
          data={visiblePosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.filters}>
              <Dropdown
                value={rescoFilter}
                options={rescoFilterOptions}
                onChange={setRescoFilter}
              />
              <View style={styles.filterChipRow}>
                {kindFilters.map((filter) => {
                  const selected = filter.id === kindFilter;
                  return (
                    <Pressable
                      key={filter.id}
                      onPress={() => setKindFilter(filter.id)}
                      style={[
                        styles.filterChip,
                        {
                          borderColor: selected ? theme.text : theme.cardBorder,
                          backgroundColor: selected ? theme.text : 'transparent',
                        },
                      ]}>
                      <ThemedText
                        type="small"
                        style={{ color: selected ? theme.background : theme.text }}>
                        {filter.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => setHideDelicates((value) => !value)}
                  style={[
                    styles.filterChip,
                    {
                      borderColor: hideDelicates ? theme.text : theme.cardBorder,
                      backgroundColor: hideDelicates ? theme.text : 'transparent',
                    },
                  ]}>
                  <ThemedText
                    type="small"
                    style={{ color: hideDelicates ? theme.background : theme.text }}>
                    {hideDelicates ? '✓ ' : ''}Hide delicates
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          }
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textMuted" style={styles.emptyState}>
              No posts match these filters yet.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const isBlurred = !!item.isSensitive && !revealedIds.has(item.id);
            return (
              <View style={styles.post}>
                <Image source={item.avatar} style={styles.avatar} contentFit="cover" />
                <View style={styles.postContent}>
                  <View style={styles.postHeader}>
                    <ThemedText style={styles.postMeta} numberOfLines={1}>
                      <ThemedText style={styles.postName}>{item.name} </ThemedText>
                      in {item.resco} Laundry
                    </ThemedText>
                    <Pressable
                      hitSlop={8}
                      onPress={() => setActionsPostId(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Post options">
                      <Icon icon={MdMoreHoriz} size={26} color={theme.text} />
                    </Pressable>
                  </View>

                  <View style={styles.metaRow}>
                    <View
                      style={[
                        styles.kindBadge,
                        {
                          backgroundColor:
                            item.kind === 'found' ? theme.available : theme.backgroundElement,
                        },
                      ]}>
                      <ThemedText
                        style={[
                          styles.kindBadgeLabel,
                          {
                            color: item.kind === 'found' ? theme.availableText : theme.textSecondary,
                          },
                        ]}>
                        {item.kind === 'found' ? 'Found item' : 'Message'}
                      </ThemedText>
                    </View>
                    <ThemedText type="small" themeColor="textMuted">
                      {item.timeAgo}
                    </ThemedText>
                  </View>

                  {item.image && (
                    <Pressable
                      disabled={!item.isSensitive}
                      onPress={() => toggleReveal(item.id)}
                      style={styles.imageWrap}>
                      <Image
                        source={item.image}
                        style={[styles.postImage, isBlurred && styles.postImageBlurred]}
                        contentFit="cover"
                        blurRadius={isBlurred ? 30 : 0}
                      />
                      {isBlurred && (
                        <View style={styles.sensitiveOverlay}>
                          <ThemedText style={styles.sensitiveOverlayText}>
                            Contains delicates / intimates{'\n'}Tap to view
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  )}

                  <ThemedText style={styles.description}>{item.description}</ThemedText>
                  {item.spotDescription && (
                    <View style={styles.spotRow}>
                      <Icon icon={MdOutlineLocationOn} size={16} color={theme.textMuted} />
                      <ThemedText type="small" themeColor="textMuted">
                        {item.spotDescription}
                      </ThemedText>
                    </View>
                  )}

                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => toggleLike(item.id)}
                      hitSlop={8}
                      style={styles.actionItem}>
                      <Icon
                        icon={item.liked ? MdFavorite : MdFavoriteBorder}
                        size={22}
                        color={item.liked ? '#E0245E' : theme.text}
                      />
                      <ThemedText
                        style={[styles.actionLabel, item.liked && { color: '#E0245E' }]}>
                        {item.likes} likes
                      </ThemedText>
                    </Pressable>

                    {item.kind === 'found' ? (
                      <Pressable
                        onPress={() => claimPost(item)}
                        disabled={item.claimed}
                        style={[
                          styles.claimButton,
                          {
                            backgroundColor: item.claimed
                              ? theme.backgroundElement
                              : theme.available,
                          },
                        ]}>
                        <ThemedText
                          style={[
                            styles.actionLabel,
                            { color: item.claimed ? theme.textMuted : theme.availableText },
                          ]}>
                          {item.claimed ? 'Claimed' : 'Claim'}
                        </ThemedText>
                      </Pressable>
                    ) : (
                      <View style={styles.actionItem}>
                        <Icon icon={MdChatBubbleOutline} size={22} color={theme.text} />
                        <ThemedText style={styles.actionLabel}>
                          {item.commentCount ?? 0} comments
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>

      <CreatePostModal
        visible={createVisible}
        defaultResco={preferredResco}
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreatePost}
      />

      <PostActionsSheet
        visible={actionsPostId !== null}
        isSensitive={!!actionsPost?.isSensitive}
        onClose={() => setActionsPostId(null)}
        onAction={handlePostAction}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    paddingTop: Spacing.two + WebTopTabBarInset,
  },
  headerSpacer: {
    width: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.34,
  },
  newPostButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPostButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.five,
  },
  filters: {
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
  post: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  postContent: {
    flex: 1,
    gap: Spacing.two,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  postMeta: {
    flex: 1,
    fontSize: 14,
  },
  postName: {
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  kindBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  kindBadgeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postImageBlurred: {
    opacity: 0.9,
  },
  sensitiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  sensitiveOverlayText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  claimButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
