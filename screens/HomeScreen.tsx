import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
    Dimensions,
    Image,
    ImageBackground,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../App';
import { PROVINCE as FALLBACK_PROVINCE } from '../constants/province';
import { getImageUrl, supabase } from '../lib/supabase';
import { Category } from '../types/place';

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const { width } = Dimensions.get('window');

const CATEGORIES: { label: string; value: Category; icon: any; color: string; size: 'large' | 'small' }[] = [
    { label: 'สถานที่ท่องเที่ยว', value: 'tourism', icon: 'map', color: '#2E8B57', size: 'large' },
    { label: 'ร้านอาหารแนะนำ', value: 'restaurant', icon: 'restaurant', color: '#FF7F50', size: 'small' },
    { label: 'คาเฟ่ & ของหวาน', value: 'cafe', icon: 'cafe', color: '#A0522D', size: 'small' },
    { label: 'วัด & ศิลปวัฒนธรรม', value: 'temple', icon: 'home', color: '#FFD700', size: 'small' },
    { label: 'งานประเพณี', value: 'festival', icon: 'calendar', color: '#FF4500', size: 'small' },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [province, setProvince] = React.useState(FALLBACK_PROVINCE);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchProvinceInfo();
    }, []);

    const fetchProvinceInfo = async () => {
        try {
            const { data, error } = await supabase
                .from('province_info')
                .select('*')
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setProvince({
                    ...FALLBACK_PROVINCE,
                    name: data.name,
                    english_name: data.english_name || FALLBACK_PROVINCE.english_name,
                    motto: data.motto || FALLBACK_PROVINCE.motto,
                    description: data.description || FALLBACK_PROVINCE.description,
                    flower: data.flower || FALLBACK_PROVINCE.flower,
                    tree: data.tree || FALLBACK_PROVINCE.tree,
                    logo_path: data.logo_path || FALLBACK_PROVINCE.logo_path,
                    hero_path: data.hero_path || FALLBACK_PROVINCE.hero_path,
                });
            }
        } catch (error) {
            console.error('Error fetching province info:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Immersive Hero Section */}
                <View style={styles.heroContainer}>
                    <ImageBackground
                        source={{ uri: getImageUrl(province.hero_path || 'mhs-hero.jpg') || '' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    >
                        <View style={[styles.heroOverlay, !province.hero_path && { backgroundColor: 'rgba(46, 139, 87, 0.4)' }]}>
                            <SafeAreaView edges={['top']} style={styles.heroHeader}>
                                <View style={styles.miniLogo}>
                                    <Image
                                        source={{ uri: getImageUrl(province.logo_path) || '' }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="contain"
                                    />
                                </View>
                            </SafeAreaView>

                            <View style={styles.glassCard}>
                                <Text style={styles.welcomeText}>ยินดีต้อนรับสู่ / Welcome to</Text>
                                <View style={styles.provinceTitleRow}>
                                    <Text style={styles.provinceText}>{province.name}</Text>
                                    <Text style={styles.provinceEngText}>{province.english_name}</Text>
                                </View>
                                <View style={styles.mottoDivider} />
                                <Text style={styles.mottoText} numberOfLines={3}>"{province.motto}"</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>ค้นพบประสบการณ์ใหม่</Text>
                        <Text style={styles.sectionSubtitle}>เลือกหมวดหมู่ที่ต้องการสำรวจ</Text>
                    </View>

                    {/* Bento Grid Layout */}
                    <View style={styles.bentoGrid}>
                        {/* Large Card: Tourism */}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={[styles.bentoCard, styles.largeCard]}
                            onPress={() => navigation.navigate('CategoryMap', { category: 'tourism', title: 'สถานที่ท่องเที่ยว' })}
                        >
                            <View style={[styles.cardIconBox, { backgroundColor: '#2E8B57' }]}>
                                <Ionicons name="map" size={28} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.cardLabel}>สถานที่ท่องเที่ยว</Text>
                                <Text style={styles.cardDesc}>แลนด์มาร์คยอดนิยม และธรรมชาติ</Text>
                            </View>
                            <Ionicons name="chevron-forward-circle" size={30} color="#2E8B5730" style={styles.cardArrow} />
                        </TouchableOpacity>

                        {/* Small Cards Row */}
                        <View style={styles.smallCardsRow}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.smallCard}
                                onPress={() => navigation.navigate('CategoryMap', { category: 'restaurant', title: 'ร้านอาหารแนะนำ' })}
                            >
                                <View style={[styles.cardIconBox, { backgroundColor: '#FF7F50', width: 40, height: 40 }]}>
                                    <Ionicons name="restaurant" size={20} color="#fff" />
                                </View>
                                <Text style={styles.smallCardLabel}>ร้านอาหาร</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.smallCard}
                                onPress={() => navigation.navigate('CategoryMap', { category: 'cafe', title: 'คาเฟ่ & ของหวาน' })}
                            >
                                <View style={[styles.cardIconBox, { backgroundColor: '#A0522D', width: 40, height: 40 }]}>
                                    <Ionicons name="cafe" size={20} color="#fff" />
                                </View>
                                <Text style={styles.smallCardLabel}>คาเฟ่</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.smallCardsRow}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.smallCard}
                                onPress={() => navigation.navigate('CategoryMap', { category: 'temple', title: 'วัด & ศาสนสถาน' })}
                            >
                                <View style={[styles.cardIconBox, { backgroundColor: '#FFD700', width: 40, height: 40 }]}>
                                    <Ionicons name="home" size={20} color="#fff" />
                                </View>
                                <Text style={styles.smallCardLabel}>วัด & วัฒนธรรม</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.smallCard}
                                onPress={() => navigation.navigate('CategoryMap', { category: 'festival', title: 'งานประเพณี' })}
                            >
                                <View style={[styles.cardIconBox, { backgroundColor: '#FF4500', width: 40, height: 40 }]}>
                                    <Ionicons name="calendar" size={20} color="#fff" />
                                </View>
                                <Text style={styles.smallCardLabel}>เทศกาล</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Identity Bento Row */}
                    <View style={styles.identityRow}>
                        <View style={styles.identityItem}>
                            <View style={[styles.identityIconBox, { backgroundColor: '#FFD70020' }]}>
                                <Ionicons name="flower" size={20} color="#DAA520" />
                            </View>
                            <View>
                                <Text style={styles.identityLabel}>ดอกไม้ประจำจังหวัด</Text>
                                <Text style={styles.identityValue}>{province.flower}</Text>
                            </View>
                        </View>
                        <View style={styles.identityItem}>
                            <View style={[styles.identityIconBox, { backgroundColor: '#2E8B5720' }]}>
                                <Ionicons name="leaf" size={20} color="#2E8B57" />
                            </View>
                            <View>
                                <Text style={styles.identityLabel}>ต้นไม้ประจำจังหวัด</Text>
                                <Text style={styles.identityValue}>{province.tree}</Text>
                            </View>
                        </View>
                    </View>

                    {/* About Province Bento */}
                    <View style={styles.aboutCard}>
                        <View style={styles.aboutHeader}>
                            <Ionicons name="information-circle" size={24} color="#2E8B57" />
                            <Text style={styles.aboutTitle}>เกี่ยวกับ {province.name}</Text>
                        </View>
                        <Text style={styles.aboutContent}>{province.description}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroContainer: {
        height: 450,
        width: '100%',
    },
    heroImage: {
        flex: 1,
    },
    heroOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 25,
        justifyContent: 'space-between',
    },
    heroHeader: {
        alignItems: 'flex-start',
    },
    miniLogo: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 25,
        padding: 25,
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            }
        }),
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    provinceTitleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginVertical: 5,
    },
    provinceText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#333',
    },
    provinceEngText: {
        fontSize: 18,
        color: '#888',
        fontWeight: '600',
    },
    mottoDivider: {
        width: 40,
        height: 4,
        backgroundColor: '#2E8B57',
        borderRadius: 2,
        marginVertical: 8,
    },
    mottoText: {
        fontSize: 13,
        color: '#555',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    content: {
        marginTop: -30,
        backgroundColor: '#F8F9FB',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 25,
    },
    sectionHeader: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#333',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
    bentoGrid: {
        gap: 15,
    },
    bentoCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    largeCard: {
        height: 160,
        justifyContent: 'space-between',
    },
    cardIconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#333',
    },
    cardDesc: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    cardArrow: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    smallCardsRow: {
        flexDirection: 'row',
        gap: 15,
    },
    smallCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        height: 110,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    smallCardLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginTop: 10,
        textAlign: 'center',
    },
    identityRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    identityItem: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    identityIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    identityLabel: {
        fontSize: 10,
        color: '#999',
        fontWeight: '600',
    },
    identityValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#333',
    },
    aboutCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 25,
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    aboutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    aboutTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#333',
    },
    aboutContent: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    aboutQuote: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
    },
    quoteText: {
        fontSize: 12,
        color: '#2E8B57',
        fontStyle: 'italic',
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default HomeScreen;
