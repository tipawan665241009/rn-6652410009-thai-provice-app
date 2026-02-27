import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getImageUrl } from '../lib/supabase';
import { Place } from '../types/place';

interface PlaceCardProps {
    place: Place;
    onPress: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{ uri: getImageUrl(place.image_path) || undefined }} style={styles.image} />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{place.name}</Text>
                <View style={styles.addressContainer}>
                    <Ionicons name="location-sharp" size={14} color="#2E8B57" />
                    <Text style={styles.address} numberOfLines={1}>{place.address}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        flexDirection: 'row',
        padding: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    address: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
});

export default PlaceCard;
