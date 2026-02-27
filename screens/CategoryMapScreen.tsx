import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RootStackParamList } from '../App';
import PremiumHeader from '../components/PremiumHeader';
import { getImageUrl, supabase } from '../lib/supabase';
import { Category, Place } from '../types/place';

type CategoryMapScreenRouteProp = RouteProp<RootStackParamList, 'CategoryMap'>;
type CategoryMapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryMap'>;

type Props = {
    route: CategoryMapScreenRouteProp;
    navigation: CategoryMapScreenNavigationProp;
};

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_SPACING = 10;

const MAE_HONG_SON_REGION = {
    latitude: 19.3020,
    longitude: 97.9685,
    latitudeDelta: 1.5,
    longitudeDelta: 1.5,
};

const CATEGORY_COLORS: Record<Category, string> = {
    tourism: '#2E8B57',
    restaurant: '#FF7F50',
    cafe: '#A0522D',
    temple: '#FFD700',
    festival: '#FF4500',
};

const CategoryMapScreen: React.FC<Props> = ({ route, navigation }) => {
    const { category, title } = route.params;
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const mapRef = useRef<MapView>(null);
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        fetchPlaces();
    }, [category]);

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('places')
                .select('*')
                .eq('category', category);

            if (error) throw error;

            if (data && data.length > 0) {
                setPlaces(data);
            } else {
                setPlaces([]);
            }
        } catch (error: any) {
            console.error('Error fetching places:', error.message);
            setPlaces([]);
        } finally {
            setLoading(false);
        }
    };

    const onMarkerPress = (index: number) => {
        setActiveIndex(index);
        const place = places[index];
        mapRef.current?.animateToRegion({
            latitude: place.latitude,
            longitude: place.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }, 350);
        scrollRef.current?.scrollTo({ x: index * (CARD_WIDTH + CARD_SPACING), animated: true });
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={CATEGORY_COLORS[category]} />
                    <Text style={[styles.loadingText, { color: CATEGORY_COLORS[category] }]}>กำลังค้นหาสถานที่...</Text>
                </View>
            ) : (
                <>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={MAE_HONG_SON_REGION}
                    >
                        {places.map((place, index) => (
                            <Marker
                                key={place.id}
                                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                                onPress={() => onMarkerPress(index)}
                            >
                                <View style={styles.markerWrapper}>
                                    <View style={[
                                        styles.markerInner,
                                        { backgroundColor: CATEGORY_COLORS[category] },
                                        activeIndex === index && styles.markerActive
                                    ]}>
                                        <Ionicons
                                            name={category === 'tourism' ? 'map' : category === 'restaurant' ? 'restaurant' : category === 'cafe' ? 'cafe' : category === 'temple' ? 'home' : 'calendar'}
                                            size={activeIndex === index ? 24 : 18}
                                            color="#fff"
                                        />
                                    </View>
                                    <View style={[styles.markerTriangle, { borderTopColor: CATEGORY_COLORS[category] }]} />
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Immersive Header */}
                    <PremiumHeader title={title} onBack={() => navigation.goBack()} />
                    {/* Floating Bento List */}
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        pagingEnabled
                        decelerationRate="fast"
                        snapToInterval={CARD_WIDTH + CARD_SPACING}
                        snapToAlignment="start"
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardList}
                        style={styles.scrollContainer}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
                            if (index !== activeIndex && index < places.length) {
                                onMarkerPress(index);
                            }
                        }}
                    >
                        {places.map((place, index) => (
                            <TouchableOpacity
                                key={place.id}
                                activeOpacity={0.9}
                                style={[styles.card, activeIndex === index && styles.activeCard]}
                                onPress={() => navigation.navigate('Detail', { place })}
                            >
                                <Image source={{ uri: getImageUrl(place.image_path) || undefined }} style={styles.cardImage} />
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{place.name}</Text>
                                    <View style={styles.cardLocation}>
                                        <Ionicons name="location" size={14} color={CATEGORY_COLORS[category]} />
                                        <Text style={styles.cardAddress} numberOfLines={1}>{place.address}</Text>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[category] + '20' }]}>
                                            <Text style={[styles.categoryBadgeText, { color: CATEGORY_COLORS[category] }]}>
                                                เปิดดูรายละเอียด
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward-circle" size={24} color={CATEGORY_COLORS[category]} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: width,
        height: height,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    markerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        // Increased container size for touch and shadow clipping
        width: 60,
        height: 60,
    },
    markerInner: {
        width: 36,
        height: 36,
        borderRadius: 18, // Perfect circle
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'visible', // Ensure shadow isn't clipped into a square
    },
    markerActive: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
    },
    markerTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -1,
    },
    scrollContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
    },
    cardList: {
        paddingHorizontal: 20,
        paddingRight: width - CARD_WIDTH,
    },
    card: {
        width: CARD_WIDTH,
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginRight: CARD_SPACING,
        flexDirection: 'row',
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    activeCard: {
        borderColor: '#2E8B57',
        borderWidth: 0.5,
    },
    cardImage: {
        width: 100,
        height: '100%',
        borderRadius: 15,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    cardAddress: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
});

export default CategoryMapScreen;
